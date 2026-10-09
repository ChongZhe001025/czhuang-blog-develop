這裡記錄我在雲原生、DevOps 與 SRE 領域的實作和思考。文章以可實際操作為目標，逐步整理安裝、設定、可執行範例與風險控管。

---

## 關注主題

- Kubernetes 與 GitOps：叢集初始化、網路與 Dashboard、宣告式部署，以及使用 Argo CD 管理發布流程。
- CI/CD 與供應鏈安全：Jenkins Pipeline、映像建置與推送，以及具備門檻控管的 Trivy 映像／檔案掃描。
- Artifact／Registry：在 Kubernetes 或 Ubuntu 部署 Harbor、設定 HTTPS，以及管理私有映像儲存庫。
- Linux 與虛擬化：Ubuntu 系統管理、Proxmox 實作，包括序列主控台與 xterm.js 整合。
- 開發與服務化：使用 Go、React 與 MongoDB 建置服務、容器化並撰寫 Swagger API 文件。
- 雲端與架構：持續實作 AWS 架構設計、IAM 治理、容器與 CI/CD 整合。

---

## 你會在這裡看到

- 實作筆記（Note）：精簡的操作指南與問題排查紀錄，協助你快速完成目標。
- 專案案例（Portfolio）：從需求與設計到可執行原型，記錄端到端交付過程。
- 流程與範本：將常見操作整理為可重用的指令、YAML／Helm 設定與 Pipeline 範例。
- 風險與事後檢討：根因、可觀測性、復原手冊與安全強化檢查表。
- 標籤導覽：文章與清單頁面會列出主題標籤（例如 #K8s、#Docker、#Jenkins），可用頁面篩選快速找到相關內容。

---

## 代表作品

- AutoSEL：自動產生並套用容器安全政策，降低手動操作與風險。
- TickBoard：完全容器化的任務看板，並提供 Swagger API 文件。
- TickBoard 透過 GitOps 交付流程部署，並使用 Terraform 建置 AWS EKS。

---

## 寫作方式與原則

- 所有設定納入 Git：偏好宣告式設定，讓變更可追蹤並容易回復。
- 可重現且可觀測：提供必要步驟與驗證點，協助快速定位問題。
- 預設安全：將掃描、最小權限與密鑰管理納入基本流程。
- 在適當處使用圖像：以註解與架構圖說明關鍵步驟，方便理解與重用。

---

## 工具與標籤

#K8s #Docker #Jenkins #ArgoCD #Harbor #Ubuntu #Proxmox #Git #Trivy #Go #React #MongoDB #SELinux #AWS

---

## 聯絡方式

如果你關注 SRE、IaC 與平台工程，歡迎透過頁尾的社群連結與我聯絡。也可以先瀏覽[作品集](/portfolio/)與[技術文章](/note/)。希望這些文章能幫助你更快把想法變成可部署的成果。
