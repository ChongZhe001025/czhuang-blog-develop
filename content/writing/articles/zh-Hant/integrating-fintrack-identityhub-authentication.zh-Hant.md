將登入流程移至共用的 Identity Service，影響的不只是登入頁面。Client、Identity Provider、API Middleware 與應用程式的授權檢查，都必須對 Redirect、Token 有效期限，以及「已驗證請求」的定義保持一致。

HomeLab 對話紀錄涵蓋 IdentityHub 與 FinTrack 的整合過程：專案設定、登入與註冊流程、Redirect、API `401` 錯誤、密碼登入、Token 儲存與安全檢視。

## 除錯個別畫面前，先定義瀏覽器流程

先記錄完整流程：

```text
FinTrack -> IdentityHub 登入 -> 回呼 FinTrack
         -> 建立應用程式 Session -> 呼叫受保護的 API
```


針對每個轉換，明確定義預期狀態：登入畫面由哪個服務負責、如何驗證 Callback、應用程式從何處取得身分 Claims，以及 Token 過期時如何處理。Redirect 成功只是其中一步，API 仍必須驗證呼叫者。

實作中的服務邊界很明確：IdentityHub 驗證 Bearer JWT、要求 Token 類型為 `access`，並在 Token 帶有 Session ID 時檢查 Session。接著 FinTrack 確認 Claims 含有 FinTrack 產品存取權，才將使用者與 Claims 放入 Request Context。因此，有效的身分 Token 若沒有產品授權，應回覆 Forbidden，而不能視為 FinTrack 登入成功。

```go
if !claims.HasProductAccess("fintrack") {
    c.AbortWithStatusJSON(http.StatusForbidden,
        gin.H{"error": "FinTrack access is required"})
    return
}
```


整合工作揭露了幾種不同的故障：

- 登入成功，但使用者沒有回到應用程式；
- Client 呼叫錯誤的服務 Origin，收到 `401`；
- 產品原本預期限制註冊，但目前仍開放註冊；
- 登出後 UI 已更新，但驗證狀態仍可使用；
- Identity Service 與 Client 對 Refresh 行為的處理不一致。

應將這些問題視為契約或狀態轉換問題，而不是一直修改登入頁面直到症狀消失。

註冊模式也是服務邊界的一部分。FinTrack 支援 `open` 與 `restricted` 設定：瀏覽器可以顯示或隱藏註冊入口，但是否允許建立帳號仍必須由 Backend／IdentityHub 政策強制執行。設定也要符合實際執行路徑（Compose Environment 或 Vite Environment）；只有前端限制並不構成授權控管。

## 授權檢查採取 Fail Closed

安全檢視指出一條可疑路徑：身分 Claims 缺失時可能仍被視為已驗證。請確認 Middleware 的控制流程，並為沒有 Claims 的請求增加回歸測試。缺少身分證據時，不得讓請求進入已驗證狀態。

明確測試以下邊界情況：

| 請求狀態 | 預期結果 |
|---|---|
| 沒有 Token 或身分 Claims | 拒絕請求，視為未驗證 |
| Access Token 無效或過期 | 拒絕，或進入已定義的 Refresh 流程 |
| 身分有效但權限不足 | 已驗證，但禁止執行 |
| 身分與權限皆有效 | 繼續執行受保護操作 |
| 登出完成 | 清除 Client Session，並拒絕後續受保護請求 |

Authentication 回答「呼叫者是誰？」；Authorization 回答「呼叫者能不能執行這個操作？」將兩者分開，能讓程式碼與錯誤回應更容易推理。

## 檢視 Token 儲存方式與設定

安全檢視也提出將 Access Token 與 Refresh Token 存在 `localStorage` 的 XSS 風險。這種方式適合瀏覽器 Client，但注入的 Script 也能讀取其中的值。請依威脅模型評估伺服器管理的 Session，或是否適合改用具適當範圍的 `HttpOnly`、`Secure` Cookie。若仍使用瀏覽器儲存空間，應縮短 Token 有效期限，並加強 Content Security 與 XSS 防護。

公開的 Client 設定必須與 Secret 分開。瀏覽器 Client ID 可以是公開資訊，但 Callback Origin、Issuer URL 與依環境區分的 Endpoint 仍須明確設定。絕不可將 Client Secret 放入前端 Bundle。

## 測試服務邊界，不只測試 UI

專案對話涵蓋登入限制、密碼登入、`401` 處理、Refresh Token 有效期限，以及增加 Client／Console 測試。應針對服務間契約建立測試：

- 允許與拒絕的 Redirect Origin；
- 開啟或關閉註冊；
- 缺失、無效與過期的身分 Claims；
- Refresh 成功與失敗；
- 登出後再呼叫受保護 API；
- Environment 設定是否指向預期的 Identity Service。

使用瀏覽器層級測試涵蓋使用者流程，並用 API 層級測試驗證安全邊界。按鈕有顯示或登入頁能載入，並不能證明授權正確。

發布前，應依安全檢視結果再次核對目前程式碼。對話紀錄指出了值得測試的問題，但本身不能證明每項問題都已修正。

目前 Source 有獨立的 IdentityHub Middleware 測試，以及 FinTrack Auth Middleware／API 測試。兩邊的責任應分開：Token 有效性與撤銷由 Identity 邊界負責；產品授權與應用程式資料存取則由 FinTrack 負責。安全檢視也要求明確驗證 `localStorage` Token 暴露風險與 Claims 缺失情境。在相應回歸案例與瀏覽器儲存行為確認之前，不要推定這些問題已完整排除。
