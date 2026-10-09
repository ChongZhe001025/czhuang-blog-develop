## 概述

這是一個以 React 前端、Gin（Go）後端與 MongoDB 建置的輕量任務看板，服務皆以 Docker 執行。API 提供 Swagger 文件，正式環境可透過 Nginx 提供 HTTPS。

本文涵蓋：
- 本機開發
- HTTPS 正式環境

#### ![](../images/icons/github-black.png)  [TickBoard](https://github.com/ChongZhe001025/TickBoard)

## 架構與元件

- 前端：React，使用 `serve` 建置並在 3000 埠提供服務
- API：Gin（預設 8082 埠），提供 `/api/*` 路由與 `/swagger`
- 資料庫：MongoDB 6（內部網路）
- Mongo Express：MongoDB 網頁管理介面（透過 `/db/` 或 8081 埠提供）
- Nginx（僅正式環境使用）：
  - `/` → 前端（127.0.0.1:3000）
  - `/api/` → Gin API（127.0.0.1:8082）
  - `/db/` → Mongo Express（127.0.0.1:8081）

相關檔案：
- `docker-compose.yml`：定義四個服務與連接埠
- `frontend/Dockerfile`：建置 React，並在 3000 埠提供服務
- `gin-api/Dockerfile`：建置監聽 8082 埠的 Gin API
- `nginx/tickboard.conf`：Nginx 與 Let's Encrypt 設定範例，示範網域為 `tickboard.example.com`

## 環境變數

後端（`gin-api/.env`，由 Docker Compose 自動載入）：

```
PORT=8082
MONGO_URI=mongodb://<username>:<password>@mongo:27017
DB_NAME=TickBoard
JWT_SECRET=<set-a-strong-secret>
```

前端（`frontend/.env`）：

```
REACT_APP_GIN_API_BASE=/

# Local development (if not using Nginx reverse proxy; call API directly)
# REACT_APP_GIN_API_BASE=http://localhost:8082
```

注意事項：
- 正式環境由 Nginx 將 `/api` 轉送至後端。前端將 `REACT_APP_GIN_API_BASE=/` 設為相對路徑，即可呼叫 `/api/...`。
- 本機開發若未使用 Nginx，可將 `REACT_APP_GIN_API_BASE` 設為 `http://localhost:8082`，直接呼叫 API。

## 本機開發

事前準備：
- Docker Desktop（含 Docker Compose）

操作步驟：
1. 未使用 Nginx 時，將前端 API 位址設為本機服務：
   - 編輯 `frontend/.env`，設定 `REACT_APP_GIN_API_BASE=http://localhost:8082`
2. 使用 Windows PowerShell 啟動所有服務：

```powershell
docker compose up -d --build
```

3. 服務位址：
- 前端：`http://localhost:3000`
- API 健康檢查：`http://localhost:8082/health`
- Swagger UI：`http://localhost:8082/swagger/index.html`
- Mongo Express：`http://localhost:8081/db`（請使用你為環境設定的 BasicAuth 憑證）

4. 常用指令：

```powershell
# Tail logs
docker compose logs -f

# Stop and remove (optionally with volumes)
docker compose down
# Also remove Mongo data volume:
docker compose down -v
```

注意：`frontend/Dockerfile` 會執行正式環境建置，再透過 `serve` 提供服務。若要使用熱更新開發流程（CRA dev server），請切換 Dockerfile 中註解的「local development」設定，並套用 `docker-compose.yml` 裡對應的範例；檔案中已提供本機開發設定供參考。

## HTTPS 正式環境

以下以 Ubuntu 為例，請依使用的 Linux 發行版調整。

1. DNS 設定：
   - 將網域（例如 `tickboard.example.com`）的 A 紀錄指向伺服器 IP。

2. 在伺服器啟動容器：

```bash
docker compose up -d --build
```

3. 安裝並設定 Nginx 與 Let's Encrypt（Debian／Ubuntu 範例）：

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Place site config (use repo file nginx/tickboard.conf and edit server_name as needed)
sudo cp nginx/tickboard.conf /etc/nginx/sites-available/tickboard
sudo ln -s /etc/nginx/sites-available/tickboard /etc/nginx/sites-enabled/tickboard
sudo nginx -t && sudo systemctl reload nginx

# Obtain and install cert (interactive)
sudo certbot --nginx -d tickboard.example.com
```

若手動管理憑證，請確認 Nginx 指向以下檔案路徑：

```
/etc/letsencrypt/live/<your-domain>/fullchain.pem
/etc/letsencrypt/live/<your-domain>/privkey.pem
```

4. 路由：
- `https://your-domain/` → 前端（:3000）
- `https://your-domain/api/` → API（:8082）
- `https://your-domain/db/` → Mongo Express（:8081；`/db` 會自動轉址至 `/db/`）

5. 快速檢查：
- 測試 Nginx：`sudo nginx -t && sudo systemctl reload nginx`
- API 健康檢查：`curl -I https://your-domain/api/health`
- Swagger：`https://your-domain/api/swagger/index.html`

## 開發備註

- API 使用 JWT（密鑰由 `JWT_SECRET` 提供），並從 Authorization Bearer 標頭或 Cookie 讀取 Token。
- CORS 允許憑證；前端 Axios 設定了 `withCredentials: true`。

## 目錄結構

- `docker-compose.yml`：啟動 MongoDB、Mongo Express、Gin API 與前端
- `frontend/`：React 應用程式（`src/`）與建置／執行用 Dockerfile
- `gin-api/`：Go Gin API（`controllers/`、`models/`、`internal/`、`docs/`）
- `nginx/tickboard.conf`：正式環境反向代理與 HTTPS 範例

## 常用本機網址

- 前端：`http://localhost:3000`
- API 健康檢查：`http://localhost:8082/health`
- Swagger：`http://localhost:8082/swagger/index.html`
- Mongo Express：`http://localhost:8081/db`
