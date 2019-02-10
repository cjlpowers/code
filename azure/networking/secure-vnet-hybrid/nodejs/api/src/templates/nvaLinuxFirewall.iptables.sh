#!/bin/bash

#########################################################
## Enable IP Forwarding
echo net.ipv4.ip_forward = 1 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf

#########################################################
## Configure iptables (forward traffic from eth1 to eth0)
iptables --flush
iptables --table nat --flush
iptables --delete-chain
iptables --table nat --delete-chain
iptables -F
iptables -X

# forward traffic from eth1 to eth0
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
iptables -A FORWARD -i eth0 -o eth1 -m state --state RELATED,ESTABLISHED -j ACCEPT

# save iptables across reboots
iptables-save > /etc/iptables.rules
