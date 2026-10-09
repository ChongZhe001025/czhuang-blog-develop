Argo CD Application 顯示 `OutOfSync` 或 `Degraded` 是症狀，還不是原因。在 HomeLab 叢集中，相似的狀態訊息可能源自不同問題：自訂資源早於 CRD 套用、Hook 還在等待、Finalizer 影響刪除，或資源由錯誤的管理層負責。

排查時，先找出哪個協調邊界失敗，再修改 Manifest，通常會更快。

## 案例一：自訂資源尚無 API 定義

有一次同步將 `PrometheusRule` 資源回報為不存在，因為目標 API Server 找不到相對應的 CRD。自訂資源必須等 CRD 註冊 API Kind 後才有效；即使 YAML 格式正確，先套用物件仍會造成同步錯誤。

首先要確認 API Discovery 結果：如果 `kubectl get crd` 與 `kubectl api-resources --api-group=monitoring.coreos.com` 都找不到該型別，修改子資源欄位並不能解決問題。應先確認 Prometheus Operator／CRD 是否已安裝及順序是否正確，再重試相依的 Application。

修改 Application 前先檢查 API Server：

```bash
kubectl get crd | grep -i prometheus
kubectl api-resources --api-group=monitoring.coreos.com
kubectl get prometheusrules -A
```


若 CRD 不存在，先找出負責安裝它的平台 Application 或 Chart，確認安裝已完成。接著建立 CRD 提供者與建立自訂資源的 Application 之間的順序。依平台架構，可以拆成不同 Argo CD Application 並明確設定相依關係、使用 Sync Wave，或等待 CRD 狀態成為 `Established` 後再套用相依資源。

API 定義缺失時不要反覆同步子 Application，這只會重複送出相同的失敗請求。

## 案例二：Namespace 的管理層不正確

叢集也引出一個設計問題：平台 Namespace 應由應用程式層的 GitOps 目錄建立，還是由負責該平台層的 Terraform Stack 管理？最後決定讓 Namespace 與可觀測性平台資源一起管理。

明確的決策是不額外建立 GitOps `01-namespaces` Application；該 Namespace 由 Terraform 的可觀測性 Stack 負責。這是資源所有權的決策，應與 CRD 套用順序的事件分開看待。

比工具選擇更重要的原則是：每個 Namespace 只由一個管理者負責。如果 Terraform 建立它，而 Argo CD 也宣告同一資源，標籤、註解或生命週期的差異可能造成 Drift，讓刪除行為難以預測。若由 Argo CD 管理，則要確保擁有它的 Application 先建立，再同步 Namespace 內的資源。

## 案例三：同步等待 Hook 或 Finalizer

Hook 會在同步生命週期的特定階段執行，並可能在完成前阻擋後續資源。Finalizer 則會在控制器完成清理前延後刪除。即使底層資源已存在，這兩種情況都可能讓 Application 看起來卡住。

Hook 等待與 Finalizer 警告來自不同對話紀錄，沒有證據顯示它們與 `PrometheusRule` CRD 缺失屬於同一個根因。應透過 Job 狀態確認 Hook 進度，並先檢查資源所屬控制器，再考慮移除 Finalizer。移除 Finalizer 可能略過清理程序，不應只是為了讓 Argo CD 畫面恢復綠色就採用。

移除任何項目之前，先檢查 Application 條件、Hook Job 狀態、資源事件與 Finalizer：

```bash
argocd app get <application>
kubectl get events -A --sort-by=.lastTimestamp
kubectl get jobs,pods -n <namespace>
kubectl get <resource> <name> -n <namespace> -o yaml
```


手動移除 Finalizer 可能略過保護持久資料的清理程序。先確認由哪個控制器負責，以及清理是否已完成或受阻。

## 可重複使用的排查步驟

1. 閱讀完整的 Argo CD 條件，找出資源與 API Group。
2. 向目標 API Server 確認該 Kind 是否已註冊。
3. 檢查管理它的 Application、Chart 與同步順序。
4. 查看事件與 Hook Job 狀態。
5. 若問題與刪除有關，檢查 Finalizer 及負責清理的控制器。
6. 確認 Terraform 與 GitOps 是否同時宣告同一個物件。
7. 修正缺少的相依項目或所有權衝突後，再執行同步。

`Synced` 與 `Healthy` 是有用的最終狀態，但修復紀錄也應說明期望狀態與實際狀態為何不一致。CRD 案例要確認 API 可被查詢且相依資源存在；Hook 案例要確認 Job 已完成；刪除案例則要確認控制器清理完成且資源生命週期符合預期。將 CRD 順序、Hook 等待、Finalizer 與資源所有權視為不同故障類型，能讓操作手冊更安全，也讓下一次排障更容易。
