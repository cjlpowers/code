# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto enp0s3
iface enp0s3 inet dhcp

auto enp0s8
iface enp0s8 inet dhcp

auto vxlan0
iface vxlan0 inet static
        #mtu 1400
        #pre-up ip link add $IFACE type vxlan id 100 group 238.182.226.153 dev enp2s0f1 || true
        #pre-up ip link add $IFACE type vxlan id 100 dstport 4789 || true
        pre-up ip link add $IFACE type vxlan id 100 dstport 4789 local 192.168.1.123 remote 192.168.1.124 || true
        up ip link set $IFACE up
        down ip link set $IFACE down
        post-down ip link del $IFACE || true
        address 10.200.1.1/24

cpowers@ub16a:~$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:33:26:49 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.123/24 brd 192.168.1.255 scope global enp0s3
       valid_lft forever preferred_lft forever
3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:d7:11:72 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.17/24 brd 10.0.0.255 scope global enp0s8
       valid_lft forever preferred_lft forever
4: vxlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 9a:57:d9:1f:14:1e brd ff:ff:ff:ff:ff:ff
    inet 10.200.1.1/24 brd 10.200.1.255 scope global vxlan0
       valid_lft forever preferred_lft forever