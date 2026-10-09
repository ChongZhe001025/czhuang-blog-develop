## 概述

此專案展示端到端的雲原生工作流程：服務容器化、CI 建置映像並推送至 Harbor、透過 Kustomize 與 Argo CD 進行 GitOps 部署，以及使用 Terraform 建立 AWS EKS 基礎設施。

#### ![](../images/icons/github-black.png)  [TickBoard runs on GitOps & EKS](https://github.com/orgs/TickBoard/repositories)

---

## 功能
- **身分驗證**：使用 JWT 註冊、登入與登出。
- **任務管理**：提供 CRUD 操作與依使用者區隔的儀表板。
- **API 文件**：Swagger UI。
- **受保護路由**：檢查用戶端登入狀態。
- **Ingress 路由**：依路徑轉送流量（`/api` → API；`/` → 前端）。
- **雲原生交付**：CI 建置、Harbor 映像儲存庫，以及透過 Argo CD 同步 GitOps 狀態。

---

## 架構
```
User Browser → HTTPS → ALB Ingress
   ├── /api → gin-api :8082 → MongoDB :27017
   └── /    → frontend :3000
```

---

## 儲存庫結構
- **應用程式**：Gin API、React 前端與 CI 工作流程。
- **部署設定**：Kustomize overlays、Ingress、Argo CD Root App 與 ApplicationSet。
- **基礎設施**：使用 Terraform 管理 EKS、VPC、IAM 與 ALB Controller。

---

## API 摘要
- **身分驗證**：`/api/auth/register`、`/api/auth/login`、`/api/auth/logout`、`/api/me`。
- **任務**：`/api/tasks`、`/api/tasks/:id`（CRUD）。

---

## 部署說明
- 使用 IaC 與 GitOps，讓部署流程可重複並自動化。
- 採用精簡容器與雲原生設計，並納入安全考量。
- 部署於 AWS EKS，並透過依路徑路由的 Ingress 提供擴充能力。
