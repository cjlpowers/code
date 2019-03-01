#!/bin/bash

docker run --rm --name certbot -it -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot certonly --server https://acme-v02.api.letsencrypt.org/directory --manual --preferred-challenges dns -d *.k8s.cpowers.dev