## 概述

- AutoSEL 監控容器事件並結合容器設定，自動產生、更新及套用 SELinux 政策。
- 使用者不必手動載入政策檔，可減少重複操作並更快因應設定變更。啟動後即可產生及更新政策；特權容器與資源掛載也會受到政策嚴格控管。

#### ![](../images/icons/github-black.png)  [AutoSEL](https://github.com/ChongZhe001025/AutoSEL)
---

## 系統架構

- 系統情境圖

![](../images/autosel/system-context-diagram.png)

- 系統元件互動設計

![](../images/autosel/component-interaction-diagram.png)

- 程式工作流程設計

![](../images/autosel/system-architecture-diagram.png)

#### 容器監控元件
- 監控 Docker 容器事件
- 依事件類型執行對應動作

![](../images/autosel/component-container-monitor.png)

#### 容器設定解析器
- 取得容器設定與檢查結果
- 解析內容並交由適合的資料擷取方法處理

![](../images/autosel/component-parser.png)

#### 政策建立器
- 為指定容器產生對應的 SELinux 政策
- 將政策載入 SELinux

![](../images/autosel/component-policy-creator.png)

#### SELinux 政策套用器
- 停止容器
- 將容器檔案系統匯出為封存檔
- 將封存檔匯入 Docker 並重新建置映像
- 移除原本的容器
- 使用自訂 SELinux 標籤建立新容器

![](../images/autosel/component-policy-applicator.png)

---

## 操作示範

#### AutoSEL — 自動產生政策
- AutoSEL 啟動後會偵測現有容器、產生建置政策所需的設定檔，並將政策載入 SELinux。接著移除舊容器並複製資料，以套用政策的方式重新建立容器，最後開始監聽容器事件。

![](../images/autosel/console/generate-policy-automatically.png)

#### AutoSEL — 自動重新載入政策
- AutoSEL 偵測到容器事件時會暫停監控，重新產生政策並替換容器，完成後再恢復監控。

![](../images/autosel/console/load-policy-automatically.png)

#### 管理特權容器
- AutoSEL 僅允許必要資源。若容器切換為 privileged 模式，系統會調整政策加入限制，避免高風險的系統層級操作。

![](../images/autosel/console/generate-policy-privileged.png)

#### 裝置掛載政策
- 以下示範裝置掛載限制：上方紅框是啟用控管前成功掛載的結果，下方則是啟用 AutoSEL 後遭阻擋的結果。

![](../images/autosel/console/generate-policy-device.png)

#### 主機掛載政策
- 啟用 AutoSEL 前：主機掛載成功。

![](../images/autosel/console/generate-policy-mount-before.png)

- 啟用 AutoSEL 後：主機掛載遭到阻擋。

![](../images/autosel/console/generate-policy-mount-after.png)

#### 系統能力政策
- 以下示範系統層級能力的限制：上方紅框顯示成功啟用 capability 並掛載主機 `/mnt/test`；下方則顯示啟用 AutoSEL 後操作遭到阻擋。

![](../images/autosel/console/generate-policy-capability.png)

---

## 專案貢獻
- AutoSEL 可依容器設定自動產生並套用 SELinux 政策，改善容器安全控管與操作效率，並處理傳統 SELinux 政策管理在容器環境中較不靈活的問題。
- 自動化設計可減少重複手動步驟與操作錯誤風險，讓使用者在多容器環境中也能更有效率地管理政策。
