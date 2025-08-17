## 1. Set Root Password

Use the following command to set a password for the root account:

```bash
sudo passwd root
```

The system will prompt you to enter and confirm a new password. Once completed, the root account will be activated.

---

## 2. Enable Root Login via SSH

If you are connecting remotely via SSH, you need to modify the SSH configuration file:

```bash
sudo nano /etc/ssh/sshd_config
```

Find the following line:

```plaintext
#PermitRootLogin prohibit-password
```

Change it to:

```plaintext
PermitRootLogin yes
```

Save the file and restart the SSH service:

```bash
sudo systemctl restart ssh
```

Root login should now be enabled over SSH.
