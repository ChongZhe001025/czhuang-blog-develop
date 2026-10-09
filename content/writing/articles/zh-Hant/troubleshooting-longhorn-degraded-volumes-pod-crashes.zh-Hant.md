兩個 `longhorn-manager` Pod 進入 `CrashLoopBackOff`，會讓 Argo CD 的平台 Application 顯示 Degraded。在一次 HomeLab 事件中，Manager 日誌指出直接原因：Talos Host 缺少 `iscsiadm`，因此無法執行該指令。Driver Deployer 等待 Longhorn Backend 是 Manager 失敗後的結果，不是最先要修復的問題。

這個案例說明，儲存事件應從故障元件本身的錯誤開始，接著追到 Node 相依項目，最後回頭確認宣告使用的 Node Image。

## 從真正不健康的元件開始

檢查 Manager Pod、所在 Node、重啟次數、事件與日誌：

```bash
kubectl -n longhorn-system get pods -o wide
kubectl -n longhorn-system describe pod <manager-pod>
kubectl -n longhorn-system logs <manager-pod> --previous
kubectl get nodes -o wide
```


初步證據顯示兩個 Manager 都在 Crash。Driver Deployer 等待 Backend Service，UI Pod 並非直接原因。沿著 Manager 啟動日誌追查，最後找到缺少 `iscsiadm` 工具。

Longhorn 的相關儲存操作需要 Host 層級的 iSCSI 工具。在 Talos 上，這項相依性應由 Machine Image 中的 System Extension 提供；在一般應用程式 Container 裡安裝套件並不是等價修正。

## 比對宣告的 Image 與執行中的 Node

Repository 已宣告一個預期包含 iSCSI Tools Extension 的 Talos Installer Image，但執行中的 Node 仍缺少 `iscsiadm`。這表示期望的 Image 設定與實際 Node Runtime 不一致。

在兩個位置確認 Extension：

1. 檢查 Talos Image Factory 或 Installer Image 定義。
2. 確認 Node 已實際升級或重新安裝為該 Image。
3. 使用目前有效的 Talos 設定，檢查 Runtime Extension 狀態。
4. 在每個 Node 上執行預期 Host Command，確認工具存在。
5. 完成後再重啟或佈署受影響的 Longhorn Workload。

排查期間，一份過期的 Talos Client 設定造成 Certificate Authority 不符。這個錯誤不能推翻 Kubernetes 證據，只代表當時無法用該 Client 設定驗證 Runtime Extension 狀態。後續從管理狀態取得目前設定，再繼續檢查。

## 修復 Node，避免恢復過程變成第二起事件

重啟 Node 前，先檢查 Workload 排程、PodDisruptionBudget 與儲存健康狀態。確認 Workload 允許後一次 Drain 一個 Node，只移除可以安全重新建立的過期失敗 Pod，並在繼續前等待 Node 與重要服務恢復。

修正 Node Image 後，確認：

- Node 狀態為 `Ready`；
- Host 上可使用 `iscsiadm`；
- Longhorn Manager 與 Driver Deployer Pod 均健康；
- Volume 與 Replica 回到預期狀態；
- Argo CD 能重新產生 Manifest，並回報平台 Application 健康。

事件期間，重啟 Node／Cilium 後曾短暫出現 Argo CD DNS 比對錯誤。後來 `argocd-repo-server` 的 DNS 查詢恢復，Application 也回到 `Synced / Healthy`。這是不同於最初缺少 iSCSI 工具的暫時症狀，不應合併成同一個 Longhorn 根因。

## 重點整理

- 重啟元件前，先讀取故障 Manager 的 Previous Log。
- 將下游「等待 Backend」訊息視為可能的症狀。
- 在 Talos 上確認宣告的 System Extension 確實存在於執行中的 Node。
- Kubernetes Kubeconfig 有效，不代表 Talos Client 設定也是最新版本。
- 一次恢復一個 Node，並在每次操作後重新檢查儲存健康狀態。
- 將原始儲存故障與維護時的暫時 DNS／GitOps 錯誤分開記錄。

此事件的根因是 Host 缺少 iSCSI 工具。更通用的排查方式是沿著第一個明確的啟動錯誤追查 Host 相依項目，並確認執行中的 Node Image 符合宣告設定。
