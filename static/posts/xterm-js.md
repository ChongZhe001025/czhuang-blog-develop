## 1. Shut Down the VM and Create a Serial Port
```sh
qm set target-vm-id -serial0 socket
```

## 2. Start the VM and Check if ttyS Appears
```sh
sudo dmesg | grep ttyS
```

## 3. Enter Edit Mode for GRUB Configuration
```sh
sudo nano /etc/default/grub
```

## 4. Modify GRUB Parameters
```sh
GRUB_CMDLINE_LINUX="quiet console=tty0 console=ttyS0,115200"
```

## 5. Update GRUB
```sh
sudo update-grub
```

## 6. Reboot the VM
```sh
sudo reboot
```
