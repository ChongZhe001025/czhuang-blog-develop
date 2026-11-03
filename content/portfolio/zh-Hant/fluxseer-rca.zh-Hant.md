# FluxSeer RCA

FluxSeer 是以 Kubernetes 為核心的根因分析控制平面，將事件問題轉換成具備明確範圍、證據連結、充分性檢查與可稽核結果的調查流程。系統預設採用唯讀操作。

## 工程挑戰

事件調查常以聊天訊息、截圖或指令歷史結束，難以確認哪些證據支持結論、哪些主張已驗證、資料來源是否降級，以及哪些資訊被送往外部模型。

FluxSeer 將調查本身設計成受治理且可檢視的 Kubernetes 工作流程。

## 架構與設計

- 以 InvestigationRequest 表示每次調查，作為操作人員問題或外部整合請求的持久入口。
- 從 Kubernetes Event 與工作負載狀態收集有界限的證據；Prometheus 與 Loki 可透過宣告式 DataSource 整合。
- 產生結論前先檢查證據是否充分，在呼叫託管模型前遮罩證據，並依證據參照驗證主張。
- 將結構化結果、證據參照、缺少的證據、降級狀態與執行脈絡儲存在 Kubernetes Resource Status。

唯讀調查流程如下：

1. 調查請求
2. 有界限的證據
3. 證據充分性與遮罩
4. 推理與主張檢查
5. 可稽核的 RCA 狀態

## 實作內容

- 使用 Go、controller-runtime Reconciler 與 Kubernetes CRD 建置調查請求、資料來源及模型 Provider 的控制平面。
- 分離證據收集、Provider 推理與主張驗證，避免模型回應繞過證據檢查。
- 保留本地 Heuristic Provider 作為不需要密鑰的預設選項；OpenAI、Claude 與 Gemini 等託管 Provider 需要明確設定與憑證。
- 在結構化 RCA Status 加入精簡證據參照、替代假設、缺少證據與降級回報、確定性 Identity，以及 Provider 執行稽核資料。
- 內建 21 個偵測模式：預設提供 6 個 Kubernetes 模式，另外 8 個 Prometheus 與 7 個 Loki 模式需要對應資料來源整合及明確啟用。

## 驗證與影響

- Repository 將 v0.4.0-beta.3 記錄為目前發布版本，並說明更廣泛的實際叢集驗證仍在進行。
- Repository 驗證結果為 15/15 P0 Runtime 情境、2/2 標準工作負載情境、5/5 請求速率突增案例，以及 10/10 高錯誤率／高延遲模式案例通過。這些是專案驗證結果，不代表正式服務等級成果。
- 預設 Helm 路徑為唯讀模式，使用不需外部模型憑證的 Heuristic Provider；託管 Provider 與變更權限都必須明確啟用。

## 限制與後續工作

- 專案目前仍為 Beta；更廣泛的實際叢集涵蓋率，以及 Adapter 驗證、重試與退避的正式環境強化仍在規劃。
- Prometheus 與 Loki 模式需要對應整合及明確啟用；21 個模式並非預設全部啟用。
- 受保護的修復功能仍屬實驗性質。目前開發範圍只允許經核准與政策控管的 Deployment Rollout Restart，並使用獨立的實驗性執行器權限；GitOps Pull Request 執行器仍在規劃中。
- 專案不是通用 Shell 或叢集 Agent，也不宣稱 RCA 結論必然代表已確認根因或工作負載已完成修復。

## 工程重點

這個專案將 Kubernetes API 設計、證據治理、模型 Provider 邊界、安全預設與驗證成熟度整合在同一個營運工作流程中。
