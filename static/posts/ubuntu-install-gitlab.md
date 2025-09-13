# GitLab on Ubuntu VM + Let's Encrypt

## 1. Cloudflare Setup

1. Log in to **Cloudflare Dashboard** → **DNS**  
2. Create a DNS record:  
   - **Type**: A  
   - **Name**: `gitlab`  
   - **Target**: `<your static public IP>`  
3. **Disable Proxy (Orange Cloud)** → Select **Gray Cloud (DNS only)** ✅  
   - Ensures Let's Encrypt can perform **HTTP-01 validation** directly against the VM.  

---

## 2. GitLab VM: Installation and HTTPS Setup

### Install GitLab CE

```bash
sudo apt update && sudo apt install -y ca-certificates curl openssh-server tzdata
curl -fsSL https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash
sudo EXTERNAL_URL="https://gitlab.example.com" apt install -y gitlab-ce
```

### Modify configuration `/etc/gitlab/gitlab.rb`

```ruby
external_url "https://gitlab.example.com"

letsencrypt['enable'] = true
letsencrypt['contact_emails'] = ['you@example.com']   # Recommended to use a valid Email
letsencrypt['auto_renew'] = true

nginx['listen_addresses']       = ['0.0.0.0']         # Allow external access
nginx['listen_port']            = 443
nginx['listen_https']           = true
nginx['redirect_http_to_https'] = true
```

Apply the configuration:

```bash
sudo gitlab-ctl reconfigure
sudo gitlab-ctl restart
```

---

## 3. GitLab root Password

After installation, the randomly generated root password is stored at:

```bash
sudo cat /etc/gitlab/initial_root_password
```

Notes:
- The password file is kept for 24 hours only, then it is automatically deleted.
- If the file does not exist → reset the root password:

```bash
sudo gitlab-rake "gitlab:password:reset[root]"
```

---

## 4. Enable Auto Start on Boot

```bash
systemctl is-enabled gitlab-runsvdir
sudo systemctl enable gitlab-runsvdir
sudo systemctl start gitlab-runsvdir

systemctl status gitlab-runsvdir --no-pager
sudo gitlab-ctl status
```