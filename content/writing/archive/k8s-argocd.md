This document has replaced personal information (such as real IP/domain) with placeholders, suitable for tutorials and sharing.

---

## 1. Install ArgoCD

- Create the namespace and deploy ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- Verify the installation
```bash
kubectl get pods -n argocd
```

---

## 2. Expose the ArgoCD Server

### Option 1: Change to NodePort
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

- Get the external port
```bash
kubectl get svc argocd-server -n argocd -o=jsonpath='{.spec.ports[?(@.port==443)].nodePort}'
```

- Access the ArgoCD Web UI
```text
https://<NODE_IP>:<PORT>
```

### Option 2 (recommended): Ingress Controller
If your cluster has an Ingress Controller (e.g., NGINX Ingress / Traefik), create an Ingress and bind a domain:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
spec:
  rules:
  - host: argocd.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
```

> If you use HTTPS, configure certificates (you can automate with cert-manager and Let's Encrypt).

---

## 3. Admin account and password

- Get the initial admin password
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

- Log in to the Web UI
```text
Username: admin
Password: the initial password obtained above
```

- Log in using the CLI
```bash
argocd login <ARGOCD_SERVER>:<PORT>
```

---

## 4. Create and manage an application

- Create an example app
```bash
argocd app create guestbook   --repo https://github.com/argoproj/argocd-example-apps.git   --path guestbook   --dest-server https://kubernetes.default.svc   --dest-namespace default
```

- Sync the app
```bash
argocd app sync guestbook
```

- Check app status
```bash
argocd app list
argocd app get guestbook
```

---

✅ After you're done:
- You can open `https://<NODE_IP>:<PORT>` or `https://argocd.example.com` in the browser.
- Use the `argocd` CLI to manage and sync applications.
