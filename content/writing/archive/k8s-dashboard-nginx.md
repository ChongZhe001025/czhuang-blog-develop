This document has replaced personal information (such as real IP/domain) with placeholders, suitable for tutorials and sharing.

---

## 1. Install Kubernetes Dashboard

- Use the official YAML to install
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

- Verify deployment status
```bash
kubectl -n kubernetes-dashboard get pods
```

- Example output
```text
NAME                                         READY   STATUS    RESTARTS   AGE
dashboard-metrics-scraper-xxxxx              1/1     Running   0          2m
kubernetes-dashboard-xxxxx                   1/1     Running   0          2m
```

---

## 2. Change Service to NodePort

- Edit the Service
```bash
kubectl -n kubernetes-dashboard edit svc kubernetes-dashboard
```

- Change `ClusterIP` to `NodePort`
```yaml
spec:
  type: NodePort
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 32000   # Choose a port between 30000-32767
```

- Verify the Service
```bash
kubectl -n kubernetes-dashboard get svc kubernetes-dashboard
```

- Example output
```text
NAME                   TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard   NodePort   10.xxx.xxx.xxx   <none>        443:32000/TCP   2m
```

> Access the Dashboard via `https://<NODE_IP>:32000`.

---

## 3. Configure Nginx Reverse Proxy (optional)

If you want to access the Dashboard via a custom domain, you can set up an Nginx reverse proxy.

- Create a site config
```bash
sudo nano /etc/nginx/sites-available/k8s-dashboard.example.com
```

- Example configuration
```nginx
server {
    listen 443 ssl;
    server_name k8s-dashboard.example.com;

    ssl_certificate /etc/nginx/ssl/dashboard.crt;
    ssl_certificate_key /etc/nginx/ssl/dashboard.key;

    location / {
        proxy_pass https://<NODE_IP>:32000;
        proxy_ssl_verify off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Enable and restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/k8s-dashboard.example.com /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

- After completion, access via
```text
https://k8s-dashboard.example.com
```

---

## 4. Create a Login Token

### Create ServiceAccount and ClusterRoleBinding
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

- Create the ServiceAccount
```bash
kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
```

- Bind Cluster Admin role
```bash
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
```

- Generate a login token
```bash
kubectl -n kubernetes-dashboard create token dashboard-admin
```

Copy the generated token and choose "Token" on the Dashboard login page to sign in.

---

## 🔑 Best Practices
1. Secure access
   - Prefer **Ingress + HTTPS** (with cert-manager for automated certificate issuance).
   - Avoid using `cluster-admin` long-term; create targeted RBAC rules instead.

2. Authentication
   - Integrate with OIDC, LDAP, or other identity providers for user logins.

3. Access control
   - Provide Dashboard views scoped to different namespaces so users only see relevant resources.

---

✅ After completion:
- Access the Kubernetes Dashboard at `https://<NODE_IP>:32000` or `https://k8s-dashboard.example.com`.
- Use the generated token to log in.
