All sensitive information (actual IPs, domains, credentials) is replaced with placeholders, suitable for tutorials and public sharing.

---

## 1. Create Namespace
```bash
kubectl create namespace harbor
```

> Ensure PersistentVolumeClaims (PVCs) are bound to the `harbor` namespace.

---

## 2. Create Data Directories and Set Permissions
```bash
mkdir /mnt/data/harbor-database

mkdir /mnt/data/harbor-redis
chown -R 999:999 /mnt/data/harbor-redis
chmod -R 770 /mnt/data/harbor-redis

mkdir /mnt/data/harbor-registry
chown -R 10000:10000 /mnt/data/harbor-registry
chmod -R 775 /mnt/data/harbor-registry

mkdir /mnt/data/harbor-trivy
mkdir /mnt/data/harbor-jobservice
```

---

## 3. Create StorageClass
**StorageClass.yaml**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

```bash
kubectl apply -f StorageClass.yaml
```

---

## 4. Create PersistentVolumes
**pv-harbor.yaml**
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-harbor-database
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: "/mnt/data/harbor-database"
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-harbor-redis
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: "/mnt/data/harbor-redis"
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-harbor-registry
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: "/mnt/data/harbor-registry"
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-harbor-trivy
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: "/mnt/data/harbor-trivy"
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-harbor-jobservice
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: "/mnt/data/harbor-jobservice"
```

```bash
kubectl apply -f pv-harbor.yaml
```

---

## 5. Create PersistentVolumeClaims
**pvc-harbor.yaml**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: harbor-database-pvc
  namespace: harbor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
  volumeName: pv-harbor-database
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: harbor-jobservice-pvc
  namespace: harbor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
  volumeName: pv-harbor-jobservice
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: harbor-redis-pvc
  namespace: harbor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
  volumeName: pv-harbor-redis
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: harbor-registry-pvc
  namespace: harbor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: standard
  volumeName: pv-harbor-registry
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: harbor-trivy-pvc
  namespace: harbor
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
  volumeName: pv-harbor-trivy
```

```bash
kubectl apply -f pvc-harbor.yaml
```

---

## 6. Edit containerd Configuration
```bash
vi /etc/containerd/config.toml
```

**config.toml (snippet example)**
```toml
[plugins."io.containerd.grpc.v1.cri".registry]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
      endpoint = ["https://registry-1.docker.io"]

    [plugins."io.containerd.grpc.v1.cri".registry.mirrors."<HARBOR_NODE_IP>:30001"]
      endpoint = ["http://<HARBOR_NODE_IP>:30001"]

  [plugins."io.containerd.grpc.v1.cri".registry.configs]
    [plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.example.com".tls]
      insecure_skip_verify = true

    [plugins."io.containerd.grpc.v1.cri".registry.configs."harbor.example.com".auth]
      username = "<HARBOR_USER>"
      password = "<HARBOR_PASSWORD>"
```

---

## 7. Edit values.yaml
```bash
helm repo add harbor https://helm.goharbor.io
helm repo update
helm show values harbor/harbor > values.yaml
```

**values.yaml example**
```yaml
expose:
  type: nodePort
  tls:
    enabled: false
  nodePort:
    name: harbor
    ports:
      http:
        port: 80
        nodePort: 30001
      https:
        port: 443
        nodePort: 30002

externalURL: https://harbor.example.com

persistence:
  enabled: true
  resourcePolicy: "keep"
  persistentVolumeClaim:
    registry:
      existingClaim: "harbor-registry-pvc"
      storageClass: "standard"
      size: 20Gi
    jobservice:
      jobLog:
        existingClaim: "harbor-jobservice-pvc"
        storageClass: "standard"
        size: 5Gi
    database:
      existingClaim: "harbor-database-pvc"
      storageClass: "standard"
      size: 10Gi
    redis:
      existingClaim: "harbor-redis-pvc"
      storageClass: "standard"
      size: 5Gi
    trivy:
      existingClaim: "harbor-trivy-pvc"
      storageClass: "standard"
      size: 5Gi
  imageChartStorage:
    disableredirect: false
    type: filesystem
    filesystem:
      rootdirectory: /storage
```

---

## 8. Install Harbor with Helm
```bash
helm install harbor harbor/harbor -f values.yaml -n harbor
```

- **Verify deployment**
```bash
kubectl get pods -n harbor
kubectl get svc -n harbor
```

---

✅ **After completion:**
- Access Harbor Web UI via `https://harbor.example.com` or NodePort (`<NODE_IP>:30001`).
- Default admin credentials are set in `values.yaml`. It is recommended to change them immediately after installation.
