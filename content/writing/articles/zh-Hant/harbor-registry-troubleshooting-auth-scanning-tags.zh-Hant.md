Harbor 問題常被描述成模糊症狀：「映像沒有部署」，但實際故障可能位於 CI 驗證、映像推送、掃描、Tag 選取或 Kubernetes Pull 存取。HomeLab Pipeline 工作曾在不同階段遇到這些問題，包括缺少推送憑證參照、掃描時 Registry 驗證失敗、掃描逾時與重複映像 Tag。

兩個具體設定錯誤能清楚呈現邊界：Harbor 的對外 Endpoint 仍公告內部 HTTP URL，而 Tunnel 的 Catch-all Route 沒有設定預期的 Host Header；另一個獨立事件則是報告擷取請求回傳 `401`，因為含有 `$` 的 Robot Username 被 Shell 展開。

實用的排查原則是先找出哪個 Client 發出了失敗請求。GitHub Actions Runner、Harbor Scanner、Argo CD Updater 與 Kubernetes Node 使用的 Credential 和網路路徑不一定相同。

## 修改 Credential 前先畫出操作路徑

```text
CI Runner -> Harbor API -> 映像 Repository
Scanner   -> Harbor API -> 映像 Manifest／Layer
叢集      -> Harbor API -> 拉取映像
```


針對失敗操作，記錄 Job 階段、Repository、Tag、HTTP Status 與時間。Credential 值須保持遮罩。確認 Job 解析了哪個 Secret Reference，以及該 Principal 是否獲得指定 Project 與操作所需的權限。

## 區分常見故障類型

### 推送驗證失敗

若 Build 成功但 Push 失敗，確認 Job 登入的 Registry Hostname 與映像名稱使用的 Hostname 相同。檢查 CI Job 是否收到預期的 Secret Reference，以及帳號是否有權將映像推送至目標 Project。測試時不要將 Token 複製到 Shell 輸出。

一次 Workflow 檢視發現 Push 階段使用已過期的 Harbor Secret 名稱。應讓實際 Job Environment 的 Secret Reference 與映像 Registry 及目標 Project 一致，再查看已遮罩的登入／推送回應。Secret 即使存在於 GitHub 設定中，只要沒有傳給該 Job，對該 Job 而言就等於不存在。

### Scanner 驗證失敗或逾時

推送成功不代表 Scanner 能讀取映像。掃描 Job 可能使用不同的 Service Account、Robot Credential 或網路路徑。若是驗證錯誤，檢查對 Project 的讀取權限；若是逾時，則檢查 Scanner Job 狀態、Harbor Job Service 日誌、Registry 連線，以及掃描是否在等待弱點資料庫更新。

不要用擴大 Registry 權限來「修復」逾時問題。驗證失敗與服務不可用是兩種不同故障。

報告擷取的 `401` 事件中，Secret 值本身存在，問題是 Shell 命令組合方式破壞了 Username。修正方法是將 Username 與 Token 作為 Environment Variable 傳入，並在觸發、狀態輪詢與報告擷取指令中引用變數。YAML 解析與 `git diff --check` 已通過；紀錄沒有 actionlint（當時無法使用）或完整線上報告擷取結果，因此在宣稱整合已修復前應再驗證兩者。

對外路由問題則要比對 Harbor 設定的 External Endpoint、Tunnel Ingress Service、Host Header 與 Scheme。來源設定顯示 Endpoint 使用內部 `http://` URL，而 Catch-all Route 未設定 `httpHostHeader`。修正應放回 GitOps Source，確保後續協調不會覆蓋它。該次操作未驗證線上 Helm Apply，因此只能描述為已診斷出設定不一致並提出來源修正，不能宣稱外部服務已確認恢復。

### Tag 與更新不一致

重複 Tag 可能讓錯誤映像看起來是最新版本。使用能連回 Source Revision 或 Build Run 的 Tag，並確認該 Tag 背後的 Digest。若 Image Updater 依 Tag Pattern 或 Update Strategy 運作，也要確認已發布的 Tag 符合規則，再檢查期望狀態變更是否送達 Argo CD。

## 從 Job 向外排查

1. 先確認失敗操作是 Login、Push、Scan、Pull 還是更新偵測。
2. 檢查確切的 Registry Hostname、Project 與映像參照。
3. 查看相關 Job 狀態與遮罩後的錯誤輸出。
4. 確認 Job 只有執行該操作所需的最小權限。
5. 檢查 Harbor 的 Project、掃描與 Job 狀態。
6. 確認映像 Manifest 與 Digest 存在。
7. 追蹤映像經過 Image Updater、Argo CD，直到執行中的 Pod。

若 Kubernetes 拉取映像失敗，檢查 Pod Event 與 Workload Namespace 中的 Image Pull Secret。CI Runner 上的 Registry Login 成功，不能證明 Node 也能拉取相同映像。

## 保持清楚的安全邊界

- 實務上，發布與拉取應使用不同 Credential 或權限。
- Scanner 只需要 Read Access，不應重用廣泛的 Push 身分。
- 不要讓 Secret 值出現在日誌、截圖或範例指令中。
- 優先使用不可變的映像識別碼，以利追蹤發布版本。
- 將掃描結果與其所描述的映像 Digest 一起保存。

這套方法能將「Harbor 壞了」轉換成對單一操作、單一 Principal 與單一映像身分的具體檢查，讓修正範圍更精確，也更容易稽核交付流程。
