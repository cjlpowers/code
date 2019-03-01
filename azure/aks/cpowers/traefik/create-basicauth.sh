#!/bin/bash

htpasswd -c ./auth cpowers
kubectl -n kube-system create secret generic basic-auth --from-file auth
rm auth