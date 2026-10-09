All sensitive information (such as actual VM IPs, lab DNS, tokens, etc.) is replaced with placeholders, suitable for tutorials and sharing.

---

## 1. Install required packages
```bash
apt install qemu-guest-agent
apt update && apt dist-upgrade
```

---

## 2. Configure networking

### Disable cloud-init networking
```bash
sudo touch /etc/cloud/cloud-init.disabled
sudo rm /etc/netplan/50-cloud-init.yaml
sudo rm -rf /etc/cloud
sudo reboot
```

### Set a static IP
```bash
cd /etc/netplan
vim 00-installer-config.yaml
```

Example:
```yaml
network:
    version: 2
    ethernets:
        ens18:
            dhcp4: false
            addresses:
                - <VM_STATIC_IP>/24
            routes:
                - to: default
                  via: <GATEWAY_IP>
            nameservers:
                addresses:
                  - <DNS_1>
                  - <DNS_2>
```

Apply the configuration:
```bash
sudo chmod 600 /etc/netplan/00-installer-config.yaml
sudo netplan generate
sudo netplan apply
```

---

## 3. Install and configure containerd
```bash
apt install containerd
systemctl status containerd
mkdir /etc/containerd
containerd config default | tee /etc/containerd/config.toml
```

Edit `/etc/containerd/config.toml`:
```toml
SystemdCgroup = true
```

### Disable swap
```bash
nano /etc/fstab
# Comment out the swap line:
#/swap.img      none    swap    sw      0       0
```

### Enable IP forwarding
```bash
nano /etc/sysctl.conf
# Ensure or add:
net.ipv4.ip_forward=1
```

### Load required kernel modules
```bash
nano /etc/modules-load.d/k8s.conf
# Add:
br_netfilter
```

---

## 4. Install Kubernetes packages
Add the repository:
```bash
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

Install:
```bash
apt update
sudo apt install kubeadm kubectl kubelet
```

---

## 5. Initialize the Kubernetes control plane
```bash
sudo kubeadm init --control-plane-endpoint=<VM_STATIC_IP> --node-name k8s-ctrlr --pod-network-cidr=10.244.0.0/16
```

Configure `kubectl`:
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Deploy Flannel CNI:
```bash
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

---

## 6. Join worker nodes

Get the join command on the control plane:
```bash
kubeadm token create --print-join-command
```

Run on each worker node:
```bash
kubeadm join <CTRL_PLANE_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>
```

---

✅ **After completion:**
- On the control plane, verify workers joined: `kubectl get nodes`.
- Consider adding **MetalLB / NGINX Ingress** to expose services externally.
