## 1. Install Required Packages
```sh
apt install qemu-guest-agent
apt update && apt dist-upgrade
```

## 2. Configure Network Settings

- **Disable Cloud-init Network Management**

```sh
sudo touch /etc/cloud/cloud-init.disabled
sudo rm /etc/netplan/50-cloud-init.yaml
sudo rm -rf /etc/cloud
sudo reboot
```

- **Example Network Configuration (Static IP)**
```sh
cd /etc/netplan
vim 00-installer-config.yaml
```

```yaml
network:
    version: 2
    ethernets:
        ens18:
            dhcp4: false
            addresses:
                - 10.1.1.100(vm-address)/24
            routes:
                - to: default
                  via: 10.1.1.1(reverse-proxy-address)
            nameservers:
                addresses:
                  - 140.127.74.142(My lab's static ip)
                  - 140.127.40.3(My school's static ip)
```

```sh
sudo chmod 600 /etc/netplan/00-installer-config.yaml
sudo netplan generate
sudo netplan apply
```

## 3. Install and Configure Containerd
```sh
apt install containerd
systemctl status containerd
mkdir /etc/containerd
containerd config default | tee /etc/containerd/config.toml
```

- **Modify Configuration**
```sh
nano /etc/containerd/config.toml
# Change SystemdCgroup = false to SystemdCgroup = true
```

- **Disable Swap**
```sh
nano /etc/fstab
# Comment out the swap line:
#/swap.img      none    swap    sw      0       0
```

- **Enable IP Forwarding**
```sh
nano /etc/sysctl.conf
# Uncomment or add:
net.ipv4.ip_forward=1
```

- **Load Required Kernel Modules**
```sh
nano /etc/modules-load.d/k8s.conf
# Add:
br_netfilter
```

## 4. Install Kubernetes Packages
```sh
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
apt update
sudo apt install kubeadm kubectl kubelet
```

## 5. Initialize Kubernetes Cluster
```sh
sudo kubeadm init --control-plane-endpoint=<vm-address> --node-name k8s-ctrlr --pod-network-cidr=10.244.0.0/16
```

- **Configure kubectl**
```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

- **Deploy Flannel Network Plugin**
```sh
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

## 6. Join Worker Nodes

- **Get join command from k8s-ctrlr**
```sh
kubeadm token create --print-join-command
```

- **K8s-node join cluster**
```sh
kubeadm join <ctrlr-vm-address>:6443 --token lgmu8y.jp21mqh04f5o76zw --discovery-token-ca-cert-hash sha256:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```