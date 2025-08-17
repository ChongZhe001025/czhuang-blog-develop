## 1. Install ArgoCD

- **Deploy ArgoCD**
```sh
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- **Verify Installation**
```sh
kubectl get pods -n argocd
```

## 2. Expose ArgoCD Server

- **Change to NodePort**
```sh
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

- **Get the External Port**
```sh
kubectl get svc argocd-server -n argocd -o=jsonpath='{.spec.ports[?(@.port==443)].nodePort}'
```

- **Access ArgoCD via**
```sh
https://<NODE_IP>:<PORT>
```

- **Retrieve Admin Password**
```sh
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d