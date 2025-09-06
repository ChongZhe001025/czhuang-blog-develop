## Overview 
A small task board project built with React (frontend), Gin (Go backend), and MongoDB. Everything runs in Docker. The API ships with Swagger, and production can be fronted by Nginx with HTTPS.

This guide covers:
- Local Development
- HTTPS Production
#### ![](../images/icons/github-black.png)  [TickBoard](https://github.com/ChongZhe001025/TickBoard)

## Architecture & Components

- Frontend: React, built and served by `serve` on port 3000
- API: Gin (default 8082) exposing `/api/*` routes and `/swagger`
- DB: MongoDB 6 (internal network)
- Mongo Express: Web GUI for Mongo (exposed as `/db/` or 8081)
- Nginx (prod only):
  - `/` → Frontend (127.0.0.1:3000)
  - `/api/` → Gin API (127.0.0.1:8082)
  - `/db/` → Mongo Express (127.0.0.1:8081)

Relevant files:
- `docker-compose.yml`: defines the four services and ports
- `frontend/Dockerfile`: builds React and serves at 3000
- `gin-api/Dockerfile`: builds Gin API listening on 8082
- `nginx/tickboard.conf`: production Nginx + Let’s Encrypt example, server_name demo: `tickboard.example.com`


## Environment Variables

Backend (`gin-api/.env`, auto-loaded by Docker Compose):

```
PORT=8082
MONGO_URI=mongodb://root:pass@mongo:27017
DB_NAME=TickBoard
JWT_SECRET=supersecret_change_me
```

Frontend (`frontend/.env`):

```
REACT_APP_GIN_API_BASE=/

# Local development (if not using Nginx reverse proxy; call API directly)
# REACT_APP_GIN_API_BASE=http://localhost:8082
```

Notes:
- In production, Nginx proxies `/api` to the backend. Keeping `REACT_APP_GIN_API_BASE=/` lets the frontend call `/api/...` relatively.
- For local dev without Nginx, set `REACT_APP_GIN_API_BASE=http://localhost:8082` to hit the API directly.


## Local Development

Prerequisites:
- Docker Desktop (with Docker Compose)

Steps:
1) Point the frontend to the local API when not using Nginx:
  - Edit `frontend/.env` and use: `REACT_APP_GIN_API_BASE=http://localhost:8082`
2) Bring everything up (Windows PowerShell):

```powershell
docker compose up -d --build
```

3) Services:
- Frontend: http://localhost:3000
- API Health: http://localhost:8082/health
- Swagger UI: http://localhost:8082/swagger/index.html
- Mongo Express: http://localhost:8081/db  (BasicAuth: `root` / `pass`)

4) Handy commands:

```powershell
# Tail logs
docker compose logs -f

# Stop and remove (optionally with volumes)
docker compose down
# Also remove Mongo data volume:
docker compose down -v
```

Notes: The `frontend/Dockerfile` runs a production build served by `serve`. If you prefer hot-reload dev flow (CRA dev server), switch to the commented "local development" section inside that Dockerfile and apply the corresponding example in `docker-compose.yml` (a commented local dev section is provided for reference).


## HTTPS Production

Example below uses Ubuntu; adjust for your distro as needed.

1) DNS:
  - Point your domain (e.g., `tickboard.example.com`) A record to your server’s IP.

2) Start containers on the server:

```bash
docker compose up -d --build
```

3) Install and configure Nginx + Let’s Encrypt (Debian/Ubuntu example):

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

If you manage certs manually, ensure the paths in Nginx point to:

```
/etc/letsencrypt/live/<your-domain>/fullchain.pem
/etc/letsencrypt/live/<your-domain>/privkey.pem
```

4) Routes:
- https://your-domain/ → Frontend (:3000)
- https://your-domain/api/ → API (:8082)
- https://your-domain/db/ → Mongo Express (:8081; `/db` auto-redirects to `/db/`)

5) Quick checks:
- Test Nginx: `sudo nginx -t && sudo systemctl reload nginx`
- API health: `curl -I https://your-domain/api/health`
- Swagger: `https://your-domain/api/swagger/index.html`


## Dev Notes

- API uses JWT (secret: `JWT_SECRET`). Tokens are read from Authorization: Bearer or cookie.
- CORS allows credentials; frontend Axios is configured with `withCredentials: true`.


## Directory Overview

- `docker-compose.yml`: spin up Mongo, Mongo Express, Gin API, and Frontend
- `frontend/`: React app (`src/`), build/runtime `Dockerfile`
- `gin-api/`: Go Gin API (`controllers/`, `models/`, `internal/`, `docs/`)
- `nginx/tickboard.conf`: production reverse proxy + HTTPS example


## Common Local URLs

- Frontend: http://localhost:3000
- API health: http://localhost:8082/health
- Swagger: http://localhost:8082/swagger/index.html
- Mongo Express: http://localhost:8081/db 