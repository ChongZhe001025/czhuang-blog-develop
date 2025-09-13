This note shows how to enable a Linux serial console on a Proxmox VM and verify you can get a login prompt (usable via Proxmox Serial Console or a web terminal like xterm.js).

---

## Prerequisites
- Proxmox VE with a Linux VM (Ubuntu example below)
- VM ID: replace `<VMID>` with your VM ID
- SSH or console access to the guest OS

---

## 1. Add a serial port in Proxmox
Shut down the VM and add a socket-backed serial port:
```sh
qm stop <VMID>
qm set <VMID> -serial0 socket
```

## 2. Start the VM and verify serial device
```sh
qm start <VMID>
dmesg | grep -i ttyS || sudo dmesg | grep -i ttyS
```
You should see `ttyS0` in the kernel logs.

## 3. Configure GRUB to expose a serial console (guest OS)
Edit `/etc/default/grub`:
```sh
sudo nano /etc/default/grub
```
Set/ensure these lines (Ubuntu):
```sh
GRUB_CMDLINE_LINUX="quiet console=tty0 console=ttyS0,115200"
```
Update GRUB:
```sh
sudo update-grub
```

## 4. Reboot and test
```sh
sudo reboot
```
After reboot, open Proxmox UI and choose the Serial console, or use:
```sh
qm terminal <VMID>
```
You should see a login prompt on the serial console.

