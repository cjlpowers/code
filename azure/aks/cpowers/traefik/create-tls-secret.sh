#!/bin/bash

kubectl delete secret tls-k8s-cpowers-dev
sudo kubectl create secret tls tls-k8s-cpowers-dev --key=/etc/letsencrypt/live/k8s.cpowers.dev/privkey.pem --cert=/etc/letsencrypt/live/k8s.cpowers.dev/fullchain.pem

kubectl -n kube-system delete secret tls-k8s-cpowers-dev
sudo kubectl -n kube-system create secret tls tls-k8s-cpowers-dev --key=/etc/letsencrypt/live/k8s.cpowers.dev/privkey.pem --cert=/etc/letsencrypt/live/k8s.cpowers.dev/fullchain.pem