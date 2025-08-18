All sensitive information has been hidden, suitable for public tutorials and sharing.

---

## 1. Set the root password

Run the following command to set a password for the root account:

```bash
sudo passwd root
```

You will be prompted to enter and confirm the new password. After this, the root account will be enabled.

---

## 2. Enable root SSH login

If you need to log in remotely as root via SSH, edit the SSH configuration file:

```bash
sudo nano /etc/ssh/sshd_config
```

Find the following line:
```text
#PermitRootLogin prohibit-password
```

Change it to:
```text
PermitRootLogin yes
```

Save the file and restart the SSH service:
```bash
sudo systemctl restart ssh
```

After that, you can log in to the server as root via SSH.

---

## 🔑 Security recommendations
1. **Avoid password authentication**  
   Use **SSH key authentication** and disable password login to reduce brute-force risks.
   ```text
   PasswordAuthentication no
   ```

2. **Restrict source IPs**  
   Limit allowed SSH source IPs using a firewall (UFW / iptables / Security Group).

3. **Change the SSH port**  
   Change the default port 22 to a custom port to reduce scanning attempts.

4. **Use Fail2Ban**  
   Install and enable Fail2Ban to protect against SSH brute-force attacks.

---

✅ **After completion:**  
You can log in as root with:
```bash
ssh root@<SERVER_IP>
```
