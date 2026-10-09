只有當 Terraform Resource 邊界與環境的實際營運方式相符時，HomeLab 才能真正透過 Terraform 重現。在 Proxmox 工作中，Production Resource 依責任拆分、Development Resource 重新建置，而 Kubernetes Provider 操作則凸顯出有效 Plan 與可連線叢集之間的差異。

本文整理管理 Proxmox 基礎設施的實用流程，不把 `terraform apply` 當成例行修復指令。

## 依責任組織資源

將可重用的基礎設定與環境專屬組態分開。依照營運責任整理資源，例如網路、叢集基礎與可觀測性，讓每項變更都有可檢視的範圍。

每個環境都應明確說明：

- 哪個 State 擁有各項資源；
- 哪些 Output 會被其他 Stack 使用；
- 需要哪些 Provider Credential 與 Endpoint；
- Plan 會影響哪個 Cluster 或 VM。

避免讓 Terraform 與 GitOps 同時管理同一個 Kubernetes 物件。Terraform 可以建立叢集基礎與指定平台相依項目；Argo CD 則協調應用程式與平台 Manifest。每個物件都要選定唯一管理者，並記錄兩者間的交接方式。

## 將 `plan` 當作安全邊界

套用變更前，先初始化目標工作目錄，並檢視 Environment、Backend 與 Provider 設定。接著產生並檢視 Plan：

```bash
terraform init
terraform plan -out=tfplan
terraform show tfplan
```


留意非預期的取代或刪除，尤其是 Control Plane VM、網路相依項目與持久化儲存。如果 Kubernetes Provider 因叢集無法連線而不能 Refresh，先修正存取或 Provider Context。逾時並不能證明預期的基礎設施變更可以安全套用。

HomeLab 工作階段曾遇到 Terraform Plan 逾時、Kubernetes 驗證失敗，以及必須重建 Development Environment 的情況，這些是不同問題：

- **逾時：** 確認目標 API 可連線，並找出卡住的 Provider 操作。
- **驗證失敗：** 確認選用的 Kubeconfig 與 Credential 屬於預期叢集。
- **環境重建：** 在決定重建或匯入資源前，比對目前狀態與目標環境。

Production Refactor 的目標是依責任將資源拆成不同 Module。之後另外重建了 Development Environment，兩者是不同變更集。一次 Plan 事件中，Terraform 在 Refresh Kubernetes Provider Resource 時停止回應。安全的下一步是修正 Cluster Context／API 存取並重新產生 Plan，因為 Refresh 失敗時無法取得安全 Apply 所需的遠端狀態。

不要用刪除 State 或自動核准 Apply 來一次處理所有問題。

## 有計畫地重建環境

重建 Development Resource 前，先盤點 Proxmox 與 Kubernetes 中現有的資源，並與 Terraform State 及組態比對。逐項決定要匯入、取代或移除哪些資源。變更 Compute Resource 前，先保護持久資料與存取路徑。

對話紀錄也顯示，只靠環境名稱不足以判斷範圍：本機 Provider Context 可能沒有指向任何叢集，也可能指向錯誤叢集，而 Terraform Backend 仍可能選到有效 State。Planning 前應一併記錄預期的 Backend Key 與 Kubernetes Context。接受重建 Plan 前，先檢查 Destroy／Replace 數量、其他 Module 使用的 State Output，以及 Persistent Volume 相依項目。

Apply 後，從多個層級驗證結果：

1. Terraform State 包含預期資源。
2. Proxmox 顯示預期 VM 與網路設定。
3. Kubernetes Node 完成註冊並進入 Ready。
4. GitOps Controller 能連線至 API 並協調平台 Application。
5. 重要儲存空間與 Workload 已恢復。

第五項特別重要：Terraform Apply 成功只證明 Provider 完成操作，不代表應用程式已恢復健康。

紀錄中的工作包含 Module 重整、Development 重建規劃／Apply，以及反覆排查 Provider 問題。一次 Production Plan 因本機 Kubernetes Context 遺失而受阻，因此不能宣稱每個 Production Module 都已套用。請依環境與執行次數記錄結果：Plan 已產生、Plan 已套用、Provider Refresh 失敗，或 Runtime 驗證已完成。

## 安全規劃 Node 維護

基礎設施變更與 Node Reboot 都可能影響 Stateful Workload。維護前先檢查 PodDisruptionBudget、儲存副本、Controller 可用性與 GitOps 健康狀態。在架構允許時一次操作一個 Node，並等 Node 與 Workload 恢復後再繼續。

## 營運原則

- 明確記錄環境所有權與 Provider Context。
- Apply 前先檢視 Plan，並分開排查 Provider 逾時。
- 重建環境時保護持久化資料。
- 劃清 Terraform 與 GitOps 的管理邊界。
- 基礎設施變更後驗證叢集與應用程式健康狀態。
- 記錄每個操作是已規劃、已套用，還是已獨立驗證。

Terraform 在 HomeLab 的價值不只在於建立資源，更在於讓變更可界定範圍、可檢視且能重複執行，同時確保 Stateful Service 可以復原。
