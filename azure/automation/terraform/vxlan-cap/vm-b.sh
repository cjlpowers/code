# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto enp0s3
iface enp0s3 inet dhcp
        up ip link set $IFACE promisc on

auto enp0s8
iface enp0s8 inet dhcp

auto enp0s9
iface enp0s9 inet dhcp
        #up ip link set $IFACE promisc on

auto vxlan0
iface vxlan0 inet static
        #mtu 1400
        #pre-up ip link add $IFACE type vxlan id 100 group 238.182.226.153 dev enp2s0f1 || true
        #pre-up ip link add $IFACE type vxlan id 100 dstport 4789 || true
        pre-up ip link add $IFACE type vxlan id 100 dstport 4789 local 192.168.1.124 remote 192.168.1.123 || true
        up ip link set $IFACE up
        down ip link set $IFACE down
        post-down ip link del $IFACE || true
        address 10.200.1.2/24

#!/bin/bash

#########################################################
## Enable IP Forwarding
#echo net.ipv4.ip_forward = 1 | sudo tee -a /etc/sysctl.conf
#echo net.ipv4.conf.all.proxy_arp = 1 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf

#########################################################
## Configure iptables
iptables --flush
iptables --table nat --flush
iptables --delete-chain
iptables --table nat --delete-chain
iptables -F
iptables -X

# forward traffic from vxlan0 to enp0s9
#iptables -t nat -A POSTROUTING -o enp0s9 -j MASQUERADE
#iptables -A FORWARD -i vxlan0 -o enp0s9 -j ACCEPT
#iptables -A FORWARD -i enp0s9 -o vxlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT

#iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE
iptables -A FORWARD -i vxlan0 -o enp0s3 -j ACCEPT
iptables -A FORWARD -i enp0s3 -o vxlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT

# save iptables across reboots
iptables-save > /etc/iptables.rules


cpowers@ub16b:~$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:be:6d:e2 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.124/24 brd 192.168.1.255 scope global enp0s3
       valid_lft forever preferred_lft forever
3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:dc:1d:f9 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.16/24 brd 10.0.0.255 scope global enp0s8
       valid_lft forever preferred_lft forever
4: enp0s9: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:01:da:e9 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.12/24 brd 10.0.2.255 scope global enp0s9
       valid_lft forever preferred_lft forever
7: vxlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 22:4e:ef:38:70:0d brd ff:ff:ff:ff:ff:ff
    inet 10.200.1.2/24 brd 10.200.1.255 scope global vxlan0
       valid_lft forever preferred_lft forever