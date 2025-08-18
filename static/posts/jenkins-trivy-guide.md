All sensitive information (domain, IP, secrets, etc.) is replaced with placeholders for public sharing and educational purposes.

---

## Prerequisites
- Host: Ubuntu or any Linux distribution.
- Docker CE and Docker Compose installed (use your standard installation process).
- Network access to Docker Hub or your own image registry.

---

> For Jenkins and Agent Docker deployment and custom image build, please refer to the separate guide: "Docker build jenkins".

---

## Deploy Trivy
This example uses the Bitnami version:
```bash
docker pull bitnami/trivy:latest
```

> You can also use the official image `aquasec/trivy:latest`, commands are similar.

Common volume mounts:
- Trivy cache: `-v /path/to/trivy-cache:/root/.cache/`
- Scan working directory (Filesystem mode): `-v "$PWD":/workspace -w /workspace`

---

## Jenkins Pipeline: Automated Trivy Scanning

The following example uses a **Declarative Pipeline** to build a Docker image and perform both **image** and **filesystem** scans with Trivy.

> Make sure you have a Jenkins node labeled `docker-agent` (i.e., the Inbound Agent described previously).

```groovy
// Jenkinsfile
pipeline {
  agent { label 'docker-agent' }
  options {
    timestamps()
    ansiColor('xterm')
  }
  environment {
    IMAGE = "yourrepo/yourapp:${env.BUILD_NUMBER}"
    TRIVY_CACHE = "/home/jenkins/.cache/trivy"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Image') {
      steps {
        sh '''
          docker version
          docker build -t "$IMAGE" .
          docker images | grep "$(echo $IMAGE | cut -d: -f1)" || true
        '''
      }
    }

    stage('Trivy Image Scan') {
      steps {
        sh '''
          mkdir -p trivy-reports
          docker run --rm             -v /var/run/docker.sock:/var/run/docker.sock             -v "$TRIVY_CACHE":/root/.cache/             bitnami/trivy:latest image               --no-progress               --severity HIGH,CRITICAL               --exit-code 1               --format table "$IMAGE" | tee trivy-reports/image.txt

          # Output JSON/SARIF for platform integration (optional)
          docker run --rm             -v /var/run/docker.sock:/var/run/docker.sock             -v "$TRIVY_CACHE":/root/.cache/             bitnami/trivy:latest image               --no-progress               --severity HIGH,CRITICAL               --exit-code 0               --format json -o trivy-reports/image.json "$IMAGE"

          docker run --rm             -v /var/run/docker.sock:/var/run/docker.sock             -v "$TRIVY_CACHE":/root/.cache/             bitnami/trivy:latest image               --no-progress               --severity HIGH,CRITICAL               --exit-code 0               --format sarif -o trivy-reports/image.sarif "$IMAGE"
        '''
      }
    }

    stage('Trivy Filesystem Scan (optional)') {
      when { expression { return fileExists('package.json') || fileExists('requirements.txt') || fileExists('go.mod') } }
      steps {
        sh '''
          docker run --rm             -v "$PWD":/workspace             -v "$TRIVY_CACHE":/root/.cache/             -w /workspace             bitnami/trivy:latest fs               --no-progress               --severity HIGH,CRITICAL               --exit-code 1               --format table . | tee trivy-reports/fs.txt
        '''
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'trivy-reports/*', fingerprint: true
    }
    success {
      echo 'Build & Scan passed.'
    }
    failure {
      echo 'Build or Scan failed. Check artifacts for details.'
    }
  }
}
```

> `--exit-code 1` will fail the pipeline if **HIGH/CRITICAL** vulnerabilities are found. Adjust severity or use `--ignore-unfixed` as needed.

---

## Report Output and Threshold Settings

### Common Trivy Options
- `--severity LOW,MEDIUM,HIGH,CRITICAL`: Specify severity levels to check.
- `--ignore-unfixed`: Ignore vulnerabilities without a fix.
- `--format table|json|sarif`: Report format.
- `--exit-code <n>`: Return code on findings (controls Jenkins pass/fail).
- `--scanners vuln,misconfig,secret,license`: Scanner types (default: vuln/misconfig).

### Generate SARIF for Platform Integration (GitHub/Security tools)
```bash
docker run --rm   -v /var/run/docker.sock:/var/run/docker.sock   -v "$TRIVY_CACHE":/root/.cache/   bitnami/trivy:latest image     --format sarif -o trivy-reports/image.sarif "$IMAGE"
```

---

## Best Practices & Security Notes

1. **Avoid running DinD inside the Agent**:
   - Mount the host's `docker.sock` directly as shown above. DinD requires privileged mode, which is riskier and more resource-intensive.

2. **Principle of Least Privilege**:
   - Run the agent as a non-root user if possible, and ensure proper permissions for `docker.sock` (e.g., add user to the appropriate group).

3. **Caching & Speed**:
   - Mount the Trivy cache directory to speed up scans (no need to re-download the database for the same version).

4. **Scan Strategy**:
   - Trigger **Filesystem scan** (dependency & IaC check) on PR/MR; add **Image scan** for main branch merges or releases.

5. **Report Retention**:
   - Use `archiveArtifacts` or publish to object storage/reporting systems to keep historical records and track security trends.

6. **Reduce False Positives**:
   - Use `.trivyignore` or `--ignorefile` to manage known/acceptable risks, and review regularly.

7. **Image Optimization**:
   - Use minimal base images (`alpine`, `distroless`), and rebuild images regularly to get the latest patches.

---

## FAQ

- **Q: Pipeline always fails due to vulnerabilities?**  
  A: Adjust `--severity` or add `--ignore-unfixed`. Review the report to determine if the risks are acceptable.

- **Q: Scans are slow?**  
  A: Ensure Trivy cache is mounted and network can download the database. You can also pre-pull the Trivy image in CI.

- **Q: Agent can't use Docker?**  
  A: Check if `/var/run/docker.sock` is mounted and the container user has permission to access the socket.
