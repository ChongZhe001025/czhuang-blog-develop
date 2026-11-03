# MQTT Infrastructure & WebSocket Architecture Assessment

瀏覽器用戶端無法直接使用原始 TCP socket 傳送 MQTT，因此瀏覽器連線必須透過安全 WebSocket 傳輸 MQTT。現有 EMQX 部署也需要重新檢視託管方式，並納入持久化與營運責任。

## Architecture and design

- 定義瀏覽器至 EMQX 的 WSS 路徑，並涵蓋 TLS、驗證與 topic ACL。
- 明確規劃 client ID、keepalive、重新連線、訂閱與後端發佈驗證行為。
- 依持久化、備份、更新、網路、監控與維護責任，比較 GKE Autopilot 與 VM 託管方式。
- 將應用程式 startup probe 問題與託管方案評估分開分析。

## Implementation

- 盤點各環境使用的 EMQX 映像版本。
- 設計 WSS listener 與瀏覽器用戶端需求，包括 TLS 憑證及 topic 存取控制。
- 評估將 EMQX 從 GKE Autopilot 遷移至 VM 所需的工作。
- 調查 Kubernetes liveness probe 過早重啟應用程式、導致初始化尚未完成的問題。
- 追查重啟原因為身分探索依賴逾時，並將其與 MQTT 託管方式評估分開處理。

## Validation and impact

- EMQX 版本、連線需求與部分 Kubernetes 啟動問題都有調查紀錄。
- 現有證據支持 WSS 設計與遷移評估，尚不能證明 WSS 已部署完成或 VM 遷移已完成。

## Limitations and next steps

- WSS 連線、憑證輪替、用戶端驗證，以及後端至瀏覽器的完整訊息路徑仍待驗證。
- 託管方案尚未定案；選擇時應一併考量可用性、成本、持久化與維護責任。

## Engineering focus

展現訊息系統架構、通訊協定理解、Kubernetes 疑難排解與基礎設施方案取捨分析。
