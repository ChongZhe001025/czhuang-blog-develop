# 📝 Windows 環境架設 EKS 筆記

## 1. 安裝必要工具

### 1.1 AWS CLI
1. 下載並安裝 AWS CLI for Windows  
   [AWS CLI MSI 安裝檔](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)  

2. 確認安裝成功：
```powershell
aws --version
```

---

### 1.2 kubectl
1. 下載最新穩定版：
```powershell
curl.exe -LO "https://dl.k8s.io/release/$(curl.exe -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe"
```

2. 把 `kubectl.exe` 移動到 `C:\Windows\System32` 或其他 PATH 目錄。  

3. 測試版本：
```powershell
kubectl version --client
```

---

### 1.3 Terraform
1. 前往 [Terraform Releases](https://developer.hashicorp.com/terraform/downloads) 下載指定版本，例如 `1.9.5`。  

2. 解壓縮並將 `terraform.exe` 放到 PATH（例如 `C:\Windows\System32`）。  

3. 驗證安裝：
```powershell
terraform -v
```

---

## 2. 設定 AWS 憑證
使用具備 **AdministratorAccess** 或至少擁有 **EKS/IAM/VPC 權限**的 IAM 使用者：  

```powershell
aws configure
```

輸入以下資訊：  
- AWS Access Key ID  
- AWS Secret Access Key  
- Default region → `ap-southeast-2`  
- Default output format → `json`  

---

## 3. 建立 EKS Cluster

假設專案結構：
```
EKS-side-project/
  └── infra/   # Terraform 定義檔
```

1. 進入專案資料夾：
```powershell
cd infra
```

2. 初始化與部署：
```powershell
terraform init
terraform plan
terraform apply -auto-approve
```

---

## 4. 更新 kubeconfig
Terraform 建立好叢集後，更新本地 kubeconfig：  

```powershell
aws eks update-kubeconfig --region ap-southeast-2 --name sideproj-eks
```

---

## 5. 驗證與部署 Demo

1. 驗證節點：
```powershell
kubectl get nodes
```

2. 建立 namespace：
```powershell
kubectl create ns demo
```

3. 部署 Nginx：
```powershell
kubectl -n demo create deploy hello --image=nginx --replicas=2
```

4. 暴露服務：
```powershell
kubectl -n demo expose deploy hello --port=80 --type=LoadBalancer
```

5. 監看服務：
```powershell
kubectl -n demo get svc -w
```


