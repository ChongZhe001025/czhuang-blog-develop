GitHub Actions Job 等待 Runner，不一定代表 Kubernetes 容量不足。使用 Actions Runner Controller（ARC）時，請求會經過多個邊界：GitHub 選擇 Runner Group 與 Label、ARC 接收請求、建立 Runner Pod，最後由 Pod 註冊並接手 Job。

HomeLab 中曾遇到 Job 長時間等待、畫面只顯示一個 Active Runner，以及 Production Runner 沒有接到工作。有效的處理方式是先找出請求在哪一個邊界停住。

事件紀錄包含：開發環境的 Scale Set 指向與 Terraform 管理 Runner 憑證不同的 Namespace；Production Runner Pod 因 Worker CPU 配額不足而 Pending；以及 Scale Set 上限為兩個 Runner，但 Workflow 仍序列建置多個映像。紀錄中的擴容提案並未確認已套用。

## 沿著請求路徑從 GitHub 查到 Pod

### 1. 檢查 Job 要求的 Label

查看 Workflow 的 `runs-on` 與 Runner Group 限制，並與 ARC Runner Scale Set 宣告的 Label 和 Group 比對。兩者不一致時，即使叢集正常，也可能沒有任何合格 Runner 可以接手。

### 2. 確認 GitHub 是否已指派 Runner

區分 Job 仍在 Queue 中，還是已指派 Runner、但 Runner 尚未啟動。Job 狀態能指出接下來應檢查匹配條件、擴容、註冊或執行階段。

### 3. 檢查 ARC 控制路徑

查看 Controller 與 Listener Pod、日誌及 Scale Set 狀態。確認 GitHub App 或註冊設定有效，但不要輸出憑證值。如果 ARC 完全沒有看到 Queue 中的 Job，先查 Controller 到 GitHub 的連線路徑，再調整 Pod 資源。

### 4. 檢查 Runner Pod 與節點容量

若 ARC 已建立 Runner，確認 Pod 是 Pending、無法拉取映像、啟動失敗，還是已成功註冊。接著檢查節點壓力、Pod 事件與排程限制。

Production 案例中，Listener 收到 Job 並要求建立 Runner Pod，但 Pod 一直停在 Pending。Worker CPU Request 約為 1939m／1950m 與 1934m／1950m。這是排程／配額問題，並不能據此認定 GitHub Token 或 Argo CD 有問題。當時提議增加 Worker vCPU，但沒有確認已 Apply。

```bash
kubectl get pods -A -o wide | grep -i runner
kubectl describe pod <runner-pod> -n <namespace>
kubectl logs <runner-pod> -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp
```


## 為什麼同時只有一個 Runner

若只有一個 Job 符合條件、Concurrency 受限，或 Scale Set 設定限制 Replica 數量，Active Runner 只有一個可能是預期行為。先確認是否有多個帶有相容 Label 的 Job 正在等待，再比對 Queue、Scale Set 上限與 Pod 排程狀態。

若多個獨立 Docker 元件都在同一個序列 Job 中建置，拆成不同 Job 可以增加平行度。測試、相依關係與發布條件仍要明確設定，避免為了縮短時間而讓不完整的 Build 發布成無效版本。

當時的 Workflow 在單一 Docker Job 中建置兩個映像。ARC 的 `maxRunners: 2` 無法平行執行同一個 Job 內的不同 Step；必須先讓 Workflow 宣告獨立 Job，GitHub 才能同時派送。

## Namespace 與 Secret 不一致

一次開發 Runner 事件中，Scale Set 指向 `github-runner-dev`，但 Terraform 預設值以及所需的 Token／Harbor Secret 都位於 `github-runner`。Listener 因此無法在目標 Namespace 找到預期 Secret。修正方式是在該獨立叢集內讓 Overlay 與資源所屬 Namespace 一致，再檢查渲染後的 Manifest 與 Listener 事件。不要只為了讓 Pod 啟動就把 Secret 值複製到其他 Namespace；應建立單一的 Namespace／所有權契約，並讓 Secret Reference 留在該處。

## 常見故障徵兆

| 症狀 | 優先檢查項目 |
|---|---|
| Job 等待，但沒有 Runner Pod | `runs-on`、Runner Group、ARC Listener 與 Scale Set 上限 |
| Runner Pod 為 Pending | 節點容量、Affinity、Taint 與資源 Request |
| Pod 已啟動卻沒有成為 Runner | 註冊路徑、權限與 Runner 日誌 |
| 所有 Job 都由同一個 Runner 接手 | Label、Concurrency、Replica 上限與 Queue 數量 |
| Runner Online，但 Workflow 沒有選到它 | Workflow 中的 Label／Group 是否完全相符 |

## 安全的排查順序

1. 記錄 Job 狀態與要求的 Label。
2. 確認 ARC 是否收到 Job，並要求建立 Runner。
3. 檢查 Controller、Listener 與 Scale Set 狀態。
4. 查看 Runner Pod 與排程事件。
5. 確認註冊狀態與 Label 匹配。
6. 只有前述檢查指出容量不足時，才調整容量。

依照這個順序排查，可以避免在 Label 不符時重啟健康的 Controller，也能把 Runner 基礎設施問題與 Workflow 設計問題分開，讓修正落在真正負責該故障的層級。
