# Jenkins + Trivy: Build Gates and Durable Scan Reports

This guide shows a Declarative Jenkins pipeline that builds an image, scans both the source tree and the built image, runs unit and integration tests, and deploys only when every required gate passes.

The HomeLab CI design used this release order: `Trivy scan → unit test → integration test → deploy`. A HIGH or CRITICAL finding, a failed unit test, or a failed integration test stops the release. Treat the Jenkinsfile below as a reusable implementation example; the conversation record confirms the gate design, not a successful production run of this exact file.

## Pipeline

Pin the Trivy container version in Jenkins configuration. Do not use `latest`: the scanner and vulnerability database change over time, and a moving image makes a past result difficult to reproduce. Configure the agent label so only an isolated build agent with the required Docker access can run this pipeline.

```groovy
pipeline {
  agent { label 'docker-agent' }

  options {
    timestamps()
    ansiColor('xterm')
    disableConcurrentBuilds()
  }

  environment {
    IMAGE = "registry.example.invalid/team/app:${env.BUILD_NUMBER}"
    TRIVY_IMAGE = 'aquasec/trivy:<PINNED_VERSION>'
    TRIVY_CACHE = '/home/jenkins/.cache/trivy'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build image') {
      steps {
        sh '''
          set -eu
          docker build --label org.opencontainers.image.revision="$GIT_COMMIT" \\
            --tag "$IMAGE" .
        '''
      }
    }

    stage('Trivy filesystem gate') {
      steps {
        sh '''
          set -eu
          mkdir -p trivy-reports
          docker run --rm \\
            -v "$PWD:/workspace" -w /workspace \\
            -v "$TRIVY_CACHE:/root/.cache/" \\
            "$TRIVY_IMAGE" fs \\
              --scanners vuln,misconfig,secret \\
              --severity HIGH,CRITICAL --exit-code 1 \\
              --format table -o trivy-reports/filesystem.txt .
        '''
      }
    }

    stage('Trivy image gate and reports') {
      steps {
        sh '''
          set +e
          mkdir -p trivy-reports

          docker run --rm \\
            -v /var/run/docker.sock:/var/run/docker.sock \\
            -v "$TRIVY_CACHE:/root/.cache/" \\
            "$TRIVY_IMAGE" image \\
              --severity HIGH,CRITICAL --exit-code 1 \\
              --format table -o trivy-reports/image.txt "$IMAGE"
          gate_status=$?

          docker run --rm \\
            -v /var/run/docker.sock:/var/run/docker.sock \\
            -v "$TRIVY_CACHE:/root/.cache/" \\
            "$TRIVY_IMAGE" image \\
              --severity HIGH,CRITICAL --exit-code 0 \\
              --format json -o trivy-reports/image.json "$IMAGE"
          json_status=$?

          docker run --rm \\
            -v /var/run/docker.sock:/var/run/docker.sock \\
            -v "$TRIVY_CACHE:/root/.cache/" \\
            "$TRIVY_IMAGE" image \\
              --severity HIGH,CRITICAL --exit-code 0 \\
              --format sarif -o trivy-reports/image.sarif "$IMAGE"
          sarif_status=$?

          set -e
          test "$json_status" -eq 0 || exit "$json_status"
          test "$sarif_status" -eq 0 || exit "$sarif_status"
          exit "$gate_status"
        '''
      }
    }

    stage('Unit tests') {
      steps { sh 'make unit-test' }
    }

    stage('Integration tests') {
      steps { sh 'make integration-test' }
    }

    stage('Deploy') {
      when { branch 'main' }
      steps {
        sh 'make deploy IMAGE="$IMAGE"'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'trivy-reports/**', allowEmptyArchive: true,
        fingerprint: true
    }
    success { echo 'All required gates passed.' }
    failure { echo 'A build, scan, or test gate failed; deployment was skipped.' }
  }
}
```

Replace the example registry, pinned Trivy version, and test/deploy commands with the project's actual values. The Trivy image scan mounts the Docker socket so it can inspect the image built on the agent. Docker socket access is effectively privileged access to the host, so use an isolated agent and do not expose it to untrusted jobs.

## What the threshold means

`--severity HIGH,CRITICAL --exit-code 1` makes findings at those severities fail the scan stage. The later JSON and SARIF commands use exit code `0` only to preserve machine-readable reports; the pipeline saves the first scan's exit code and returns it after report generation. This prevents report formatting from accidentally turning a failed security gate green.

The pipeline scans filesystem dependencies, configuration and secrets, then scans the built image for vulnerabilities. Adjust `--scanners` to the policy you intend to enforce. If the team chooses `--ignore-unfixed`, document that exception because the gate will no longer fail for findings without a published fix.

## Report handling

- The table reports are readable in the Jenkins artifact browser and useful during incident review.
- JSON is suitable for scripts that aggregate or compare findings.
- SARIF can be uploaded to GitHub Code Scanning or another compatible service when credentials and upload steps are configured. Generating a SARIF file alone does not publish it.
- `post { always { archiveArtifacts ... } }` keeps reports when the scan fails, which is when they are most useful. Keep retention aligned with the image digest and build record.
- Never print registry credentials or embed them in shell strings. Bind credentials through Jenkins credentials/environment facilities and mask them in logs.

## Diagnose the failing boundary

If the pipeline fails, use the first failing stage. A scanner login or image-pull error is different from a vulnerability threshold failure; unit and integration failures are later release gates. Keep scan findings tied to the immutable image identity, and deploy only after all required checks pass.

The HomeLab flow design explicitly placed Trivy, unit, and integration checks before deployment and stopped on HIGH/CRITICAL or test failure. That confirms the intended release contract. A Jenkins execution log is still needed before claiming this example was deployed or that a real image passed the gate.
