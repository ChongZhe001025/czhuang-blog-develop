All sensitive information (domain, IP, secrets, etc.) is replaced with placeholders for public sharing and educational purposes.

------------------------------------------------------------------------

## 1. Install Docker Engine

``` bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
```

Add Docker GPG key and repository:

``` bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Install Docker:

``` bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

Verify:

``` bash
sudo systemctl status docker
```

------------------------------------------------------------------------

## 2. Install Docker Compose

``` bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

------------------------------------------------------------------------

## 3. Install Harbor

Download and extract:

``` bash
wget https://github.com/goharbor/harbor/releases/download/v2.10.1/harbor-offline-installer-v2.10.1.tgz
tar xzvf harbor-offline-installer-v2.10.1.tgz
cd harbor
cp harbor.yml.tmpl harbor.yml
```

------------------------------------------------------------------------

## 4. Obtain SSL Certificates (Let's Encrypt)

### Option A: HTTP-01 (simple, requires port 80)

``` bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Ensure port 80 is free
sudo certbot certonly --standalone   -d <your-domain>   -m <your-email> --agree-tos --no-eff-email   --key-type ecdsa --elliptic-curve secp384r1
```

### Option B: DNS-01 (no need to open port 80, e.g., Cloudflare)

``` bash
sudo snap install certbot-dns-cloudflare
sudo bash -c 'cat >/etc/letsencrypt/cloudflare.ini <<EOF
dns_cloudflare_api_token = <CLOUDFLARE_DNS_API_TOKEN>
EOF'
sudo chmod 600 /etc/letsencrypt/cloudflare.ini

sudo certbot certonly   --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini   -d <your-domain>   -m <your-email> --agree-tos --no-eff-email   --key-type ecdsa --elliptic-curve secp384r1
```

Certificates will be saved in:

    /etc/letsencrypt/live/<your-domain>/fullchain.pem
    /etc/letsencrypt/live/<your-domain>/privkey.pem

------------------------------------------------------------------------

## 5. Configure Harbor with HTTPS

Edit `harbor.yml`:

``` yaml
hostname: <your-domain>
external_url: https://<your-domain>

http:
  port: 8080   # optional for internal/debug

https:
  port: 443
  certificate: /etc/letsencrypt/live/<your-domain>/fullchain.pem
  private_key: /etc/letsencrypt/live/<your-domain>/privkey.pem

data_volume: /data
harbor_admin_password: <StrongPassword>

trivy:
  enabled: true
  skipUpdate: false
  insecure: false

jobservice:
  max_job_workers: 10
```

Apply changes:

``` bash
cd harbor
sudo ./prepare
sudo ./install.sh --with-trivy

# If install.sh fails, manually start Harbor containers
docker compose -f /home/ubuntu/harbor/docker-compose.yml up -d
```

------------------------------------------------------------------------

## 6. Auto-Renew Certificates

Add a deploy hook so Harbor reloads when certs renew:

``` bash
sudo bash -c 'cat >/etc/letsencrypt/renewal-hooks/deploy/harbor-reload.sh <<EOF
#!/usr/bin/env bash
set -e
docker compose -f /opt/harbor/docker-compose.yml restart nginx || docker restart nginx
EOF'
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/harbor-reload.sh
```

Test renewal:

``` bash
sudo certbot renew --dry-run
```

------------------------------------------------------------------------

## 7. Verify & Test

Check HTTPS:

``` bash
curl -I https://<your-domain>
```

Login and push/pull images:

``` bash
docker login <your-domain>
docker pull alpine:3.20
docker tag alpine:3.20 <your-domain>/demo/alpine:3.20
docker push <your-domain>/demo/alpine:3.20
docker pull <your-domain>/demo/alpine:3.20
```

------------------------------------------------------------------------

✅ **Access Harbor UI:**\
- URL: `https://<your-domain>`\
- Default user: `admin`\
- Password: set in `harbor.yml`