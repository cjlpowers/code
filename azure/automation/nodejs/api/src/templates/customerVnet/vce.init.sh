#!/bin/bash

#########################################################
## Configure iptables (forward traffic from eth1 to eth0)
iptables --flush
iptables --table nat --flush
iptables --delete-chain
iptables --table nat --delete-chain
iptables -F
iptables -X

# mirror all traffic to sensor
iptables -t mangle -I PREROUTING -i eth1 -j TEE --gateway 10.1.1.6
iptables -t mangle -I POSTROUTING -o eth1 -j TEE --gateway 10.1.1.6

# save iptables across reboots
iptables-save > /etc/iptables.rules
