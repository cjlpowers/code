#!/bin/bash

#########################################################
## Configure iptables (forward traffic from eth1 to eth0)
iptables --flush
iptables --table nat --flush
iptables --delete-chain
iptables --table nat --delete-chain
iptables -F
iptables -X

# log and drop traffic
iptables -A INPUT -i eth1 -j LOG
iptables -A INPUT -i eth1 -j DROP

# save iptables across reboots
iptables-save > /etc/iptables.rules
