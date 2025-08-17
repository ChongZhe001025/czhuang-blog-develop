## 1. Install Kubernetes Dashboard

- **Kubernetes provides a YAML file to install the Dashboard**
```sh
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

- **Verify the deployment**
```sh
kubectl -n kubernetes-dashboard get pods
```

- **If all Pods are in the Running state, the installation is successful**
```sh
NAME                                        READY   STATUS    RESTARTS   AGE
dashboard-metrics-scraper-7b64584c5c-hfzdx   1/1     Running   0          2m
kubernetes-dashboard-789ff87696-7bvq9        1/1     Running   0          2m
```

## 2. Change Service Type to NodePort

- **Edit the Service**
```sh
kubectl -n kubernetes-dashboard edit svc kubernetes-dashboard
```

- **Locate this section**
```yaml
spec:
  type: ClusterIP
```

- **Change it to**
```yaml
spec:
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 32000  # Choose a port between 30000-32767
```

- **Verify the Service**
```sh
kubectl -n kubernetes-dashboard get svc kubernetes-dashboard
```

- **Expected output**
```sh
NAME                   TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard   NodePort   10.108.183.34   <none>        443:32000/TCP   2m
```

## 3. Configure Nginx Reverse Proxy

- **Create a new configuration file**
```sh
sudo nano /etc/nginx/sites-available/k8s-dashboard.your-web.com
```

- **Add the following configuration**
```nginx
server {
    listen 443 ssl;
    server_name dashboard.example.com;

    ssl_certificate /etc/nginx/ssl/dashboard.crt;
    ssl_certificate_key /etc/nginx/ssl/dashboard.key;

    location / {
        proxy_pass https://192.168.1.100:32000;  # Kubernetes Node IP
        proxy_ssl_verify off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- **Enable the Configuration & Restart Nginx**
```sh
sudo ln -s /etc/nginx/sites-available/k8s-dashboard.your-web.com /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

- **Now, you can access the Dashboard at**
```sh
https://k8s-dashboard.your-web.com
```

## 4. Create Login Token

- **Create a ServiceAccount and ClusterRoleBinding**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

- **Generate Service Account**
```sh
kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
```

- **Grant Cluster Admin permissions**
```sh
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
```

- **Create token**
```sh
kubectl -n kubernetes-dashboard create token dashboard-admin
```

Copy this token, go to the Dashboard login page, select Token, and paste it to log in.