# Based on https://hub.docker.com/r/atlassian/bamboo-agent-base/dockerfile but using docker in docker ("dind") as base
FROM atlassian/bamboo-agent-base:6.8
USER root

# Install Git
RUN apt-get update
RUN apt-get install -y \
    git

# Install Docker Client
RUN apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
RUN apt-get update
RUN apt-get install -y \
    docker-ce-cli

RUN groupadd docker
RUN usermod -aG docker ${BAMBOO_USER}

# Install kubectl
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list
RUN apt-get update
RUN apt-get install -y \
    kubectl

# Add more advanced version of envsubst (https://github.com/a8m/envsubst)
COPY envsubst /usr/bin/
RUN chmod +x /usr/bin/envsubst