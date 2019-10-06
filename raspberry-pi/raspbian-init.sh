set -x

# update 
apt-get update && sudo apt-get -y upgrade

# install docker
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
service docker restart

docker run --restart always --device=/dev/vchiq --device=/dev/vcsm --volume=/opt/vc:/opt/vc --volume=/boot:/boot --volume=/sys:/dockerhost/sys:ro --volume=/etc:/dockerhost/etc:ro --volume=/proc:/dockerhost/proc:ro --volume=/usr/lib:/dockerhost/usr/lib:ro -p=8888:8888 --name="rpi-monitor" -d michaelmiklis/rpi-monitor:latest