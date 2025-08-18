All sensitive information (domain, IP, secrets, etc.) is replaced with placeholders for public sharing and educational purposes.

## 1. Install Docker Engine
- Update packages:
```bash
sudo apt-get update
```
- Install required packages:
```bash
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
```
- Add Docker official GPG key:
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
- Set up the stable repository:
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
- Install Docker Engine:
```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```
- Verify installation:
```bash
sudo systemctl status docker
```

---

## 2. Install Docker Compose
- Download:
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```
- Make it executable:
```bash
sudo chmod +x /usr/local/bin/docker-compose
```
- Verify:
```bash
docker-compose --version
```

---

## 3. Install Harbor
- Download Harbor:
```bash
wget https://github.com/goharbor/harbor/releases/download/v2.10.1/harbor-offline-installer-v2.10.1.tgz
```
- Extract:
```bash
tar xzvf harbor-offline-installer-v2.10.1.tgz
```
- Enter the directory and copy the config file:
```bash
cd harbor
cp harbor.yml.tmpl harbor.yml
sudo nano harbor.yml
```

### Harbor config example
```yaml
hostname: <your-server-ip-or-domain>
http:
  port: 80

# https:
#   port: 443
#   certificate: /etc/ssl/certs/certificate.crt
#   private_key: /etc/ssl/certs/private.key

external_url: https://your-harbor-domain.com
```

- Configure storage and initialize:
```bash
sudo ./prepare
```

### Generate self-signed certificate (for testing)
```bash
cd /etc/ssl/certs
openssl genrsa -out private.key 2048
openssl req -new -x509 -key private.key -out certificate.crt -days 365
```

### Enable Trivy security scan
Add to `harbor.yml`:
```yaml
trivy:
  enabled: true
  skipUpdate: false
  insecure: false
```

- Install and start Harbor:
```bash
sudo ./install.sh --with-trivy
```
- Verify services:
```bash
sudo docker-compose ps
```

---

## 4. Configure HTTPS with Nginx
- Create site config:
```bash
sudo nano /etc/nginx/sites-available/harbor.conf
```

### Nginx config example
```nginx
server {
    listen 80;
    server_name your-harbor-domain.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-harbor-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/certs/your-cert.key;

    location / {
        proxy_pass http://localhost;
        client_max_body_size 20g;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

- Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/harbor.conf /etc/nginx/sites-enabled/
```
- Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

✅ **After completion:**
- Access Harbor UI at `https://your-harbor-domain.com`
- Default account: `admin`, password is set in `harbor.yml` as `harbor_admin_password`.
