本文示範 Declarative Jenkins Pipeline：建置映像、掃描原始碼目錄與建置完成的映像、執行單元及整合測試，並且只有所有必要檢查都通過才部署。

HomeLab CI 設計採用以下發布順序：`Trivy scan → unit test → integration test → deploy`。發現 HIGH 或 CRITICAL 弱點、單元測試失敗或整合測試失敗，都會停止發布。下方 Jenkinsfile 是可重用的實作範例；對話紀錄能確認 Gate 設計，但不能證明這份檔案曾成功在正式環境執行。

## Pipeline

在 Jenkins 設定中固定 Trivy Container 版本，不要使用 `latest`：Scanner 與弱點資料庫會持續變動，若映像版本浮動，過去的結果就難以重現。設定 Agent Label，確保只有具備必要 Docker 存取權限的隔離 Build Agent 能執行此 Pipeline。

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


請將範例 Registry、固定的 Trivy 版本，以及測試／部署指令替換為專案實際值。Trivy Image Scan 會掛載 Docker Socket，以便檢查 Agent 上建置的映像。Docker Socket 幾乎等同主機特權權限，因此應使用隔離 Agent，且不能讓不受信任的 Job 使用它。

## 嚴重性門檻的意義

`--severity HIGH,CRITICAL --exit-code 1` 會在掃描發現這兩種嚴重性弱點時，讓 Scan Stage 失敗。後續 JSON 與 SARIF 指令使用 Exit Code `0`，目的只是保留機器可讀報告；Pipeline 會先保存第一次掃描的 Exit Code，產生報告後再回傳。因此報告格式化不會意外將失敗的安全 Gate 變成成功。

Pipeline 會先掃描檔案系統中的相依套件、設定與 Secret，再掃描建置完成映像中的弱點。請依預計執行的政策調整 `--scanners`。若團隊選擇使用 `--ignore-unfixed`，要記錄這項例外，因為如此一來，尚未發布修補版本的弱點就不會讓 Gate 失敗。

## 報告處理

- Table 報告可在 Jenkins Artifact Browser 閱讀，也適合事件檢視。
- JSON 適合由 Script 彙整或比較發現項目。
- 若已設定 Credential 與上傳步驟，可將 SARIF 上傳至 GitHub Code Scanning 或其他相容服務。單純產生 SARIF 檔案不等於已發布它。
- `post { always { archiveArtifacts ... } }` 會在掃描失敗時保留報告，而失敗時正是最需要檢視報告的時候。保存期限應與映像 Digest 及 Build 紀錄相符。
- 不要輸出 Registry Credential，也不要將它嵌入 Shell 字串。應透過 Jenkins Credential／Environment 機制綁定，並在日誌中遮罩。

## 依失敗邊界診斷

Pipeline 失敗時，先看第一個失敗的 Stage。Scanner 登入或映像拉取錯誤，與弱點嚴重性門檻失敗不同；單元與整合測試則是後續發布 Gate。掃描發現應連結到不可變映像識別碼，且只有所有必要檢查通過才部署。

HomeLab 流程設計明確將 Trivy、單元與整合檢查放在部署之前，並在發現 HIGH／CRITICAL 弱點或測試失敗時停止。這確認了預期的發布契約。若要宣稱此範例已部署，或實際映像已通過 Gate，仍需 Jenkins 執行日誌作為證據。
