Expose the Proxmox Web UI (internal `https://localhost:8006`) to the public through **Cloudflare Tunnel**,  
without needing floating IPs or port forwarding.

---

##  Install cloudflared
```bash
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
dpkg -i cloudflared.deb
```

---

##  Create Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create proxmox
cloudflared tunnel route dns proxmox proxmox.example.com
```

---

##  Configuration `/etc/cloudflared/config.yml`
```yaml
tunnel: proxmox
credentials-file: /root/.cloudflared/proxmox.json

ingress:
  - hostname: proxmox.example.com
    service: https://localhost:8006
  - service: http_status:404
```

---

##  Start Service
```bash
systemctl enable cloudflared
systemctl start cloudflared
```