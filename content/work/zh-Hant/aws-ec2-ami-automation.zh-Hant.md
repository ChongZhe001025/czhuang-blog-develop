# AWS EC2 Deployment & AMI Automation

建立暫用 EC2 映像建置機並擷取 AMI，需要反覆查詢設定和手動傳遞參數。若沿用錯誤的來源設定，可能造成啟動配置偏差；而分開執行的腳本也容易遺失執行個體 ID，或混淆兩階段各自的 dry-run 控制。後續排查還遇到加密磁碟區的 KMS 存取、SSM 連線，以及如何清理舊映像又不刪除仍被引用資源等問題。

## Architecture and design

- 將建置用執行個體建立與 AMI 擷取視為兩個獨立階段，以新建執行個體的 ID 作為明確交接資訊。
- 從服務目前啟用的 Auto Scaling Group 與 InService 執行個體取得啟動設定，包括基礎 AMI、執行個體規格、子網路、安全群組、金鑰組與執行個體設定檔。
- 輸出可安全貼入 Shell 的參數，包含區域、執行個體 ID、服務、環境、日期、重新啟動、AMI dry-run 與等待選項；只有實際啟動建置機時才寫入本機交接檔。
- 將映像清理與映像建立分開：先從 EC2、Launch Template 的 Default／Latest 版本及 Launch Configuration 收集引用，再依映像年齡篩選候選項目。

### Workflow

1. 目前啟用的 Auto Scaling Group
2. 沿用設定建立 EC2 建置機
3. 交接映像建置參數
4. 擷取並標記 AMI
5. 依引用與年齡篩選舊映像

## Implementation

- 加入服務白名單，並依共用命名規則推導候選 Auto Scaling Group；無法辨識唯一啟用群組時停止，避免從不確定的部署目標建機。
- 從目前啟用的執行個體取得啟動參數，避免在指令中重複硬編碼各環境設定。若發現多個子網路，腳本會警告並選取第一個；這仍是需要操作人員留意的決策點。
- 讓建置腳本輸出 AMI 腳本所需的完整參數；只有實際建立 EC2 時才更新本機 .ec2_env 交接檔，避免把產生的執行個體狀態提交至版本控制。
- 將 EC2 啟動 dry-run 與 AMI 建立 dry-run 分開控制，並提供 no-reboot 與 wait 選項，讓兩階段能分別檢查。
- 避免使用 Bash 4 關聯陣列，維持對 macOS 預設 Bash 3.2 的相容性。
- 建立 AMI 清理流程，合併 EC2、Launch Template Default／Latest 版本與 Launch Configuration 的引用清單，再篩選未引用且建立超過一年的映像。Snapshot 另行檢查，因同一份 Snapshot 可能仍被其他 AMI 使用。
- 在相鄰的 CDK 管理 Ubuntu 啟動流程中，加強 SSM 診斷：支援 snap 管理與套件安裝的 Agent，透過 IMDSv2 取得區域，並檢查執行個體角色、區域 SSM endpoint 與服務狀態。

## Operational findings

- EC2 成功啟動不代表 AMI 一定能建立：若 EBS 磁碟使用加密，必須確認 KMS key 已啟用，且 key policy／grant 允許呼叫身分執行 kms:CreateGrant、kms:Decrypt、kms:DescribeKey、kms:GenerateDataKeyWithoutPlaintext 與 kms:ReEncrypt。
- SSM 連線是另一條身分、啟動程序與網路路徑。執行個體需要相容且運作中的 Agent、執行個體設定檔權限、Metadata 存取，以及對區域 SSM messaging endpoint 的對外連線。
- 取消註冊 AMI 不會自動刪除 EBS Snapshot。刪除前要確認 Snapshot 沒有被其他保留中的 AMI 使用，清理後再查詢 AMI 與 Snapshot 狀態。

## Validation and impact

- 自動化腳本有 Shell 語法與 help 輸出的檢查紀錄。
- 新增服務的 AWS EC2 dry-run 回傳 Request would have succeeded，且沒有啟動執行個體。
- 曾實際建立建置用 EC2，確認啟動階段可執行；後續 AMI 建立因附加加密磁碟的 KMS 存取錯誤而停止。這代表部分流程已執行，並非 AMI 發佈端到端完成。
- 一次 AMI 與 Snapshot 清理作業完成後，AWS 查詢未再找到目標物件，取消註冊與刪除錯誤皆為零。

## Limitations and next steps

- KMS 阻擋的 AMI 建立尚無成功重試紀錄；也未確認每個服務都完成 Auto Scaling 部署、目標群組健康檢查與復原演練。
- 若來源執行個體位於多個子網路，現行腳本會警告後選第一個；仍應明確確認可用區、子網路容量與網路路徑，或改為讓操作人員指定。
- 清理引用掃描涵蓋 EC2 執行個體、Launch Template Default／Latest 版本與 Launch Configuration；沒有紀錄能證明它檢查所有明確指定版本的 Launch Template 或外部帳號引用，因此刪除前仍需人工審查候選清單。
- SSM 啟動流程的變更通過 Shell 語法檢查，但沒有即時執行個體驗收紀錄。
- 目前沒有部署時間、映像建置時間、成本或失敗率改善的量測結果。

## Engineering focus

展現 AWS 自動化、實用的 Shell 工程、部署流程標準化與雲端問題排查能力。
