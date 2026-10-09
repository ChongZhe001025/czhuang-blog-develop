## 1. Install Prerequisites

### AWS CLI
1. Download and install AWS CLI for Windows:  
   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

2. Verify installation:
```powershell
aws --version
```

---

### kubectl
1. Download the latest stable release:
```powershell
curl.exe -LO "https://dl.k8s.io/release/$(curl.exe -L -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe"
```

2. Move `kubectl.exe` into a directory on your `PATH` (for example `C:\Windows\System32` or another tools folder on PATH).

3. Check the client version:
```powershell
kubectl version --client
```

---

### Terraform
1. Download the desired version from Terraform Releases (e.g., `1.9.5`):  
   https://developer.hashicorp.com/terraform/downloads

2. Unzip and place `terraform.exe` on your `PATH` (for example `C:\Windows\System32`).

3. Verify installation:
```powershell
terraform -v
```

---

## 2. Configure AWS Credentials
Use an IAM user with **AdministratorAccess** or permissions covering **EKS/IAM/VPC**.

```powershell
aws configure
```

Provide the following:
- AWS Access Key ID
- AWS Secret Access Key
- Default region → `ap-southeast-2`
- Default output format → `json`

---

## 3. Create the EKS Cluster

Assumed project structure:
```
EKS-side-project/
  └── infra/   # Terraform definitions
```

1. Change into the project folder:
```powershell
cd infra
```

2. Initialize and deploy:
```powershell
terraform init
terraform plan
terraform apply -auto-approve
```

---

## 4. Update kubeconfig
After Terraform finishes provisioning, update your local kubeconfig:

```powershell
aws eks update-kubeconfig --region ap-southeast-2 --name sideproj-eks
```

---

## 5. Validate and Deploy a Demo

1. Verify nodes:
```powershell
kubectl get nodes
```

2. Create a namespace:
```powershell
kubectl create ns demo
```

3. Deploy NGINX:
```powershell
kubectl -n demo create deploy hello --image=nginx --replicas=2
```

4. Expose the deployment:
```powershell
kubectl -n demo expose deploy hello --port=80 --type=LoadBalancer
```

5. Watch the service:
```powershell
kubectl -n demo get svc -w
```
