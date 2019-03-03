#!/bin/bash
set -e

# Generate kubernetes deployment.yaml
envsubst -no-unset -no-empty < $1 > deployment.yaml

# Build the docker image
docker build \
    --build-arg test_layer_label=${bamboo_repository_name}/${bamboo_repository_branch_name} \
    -t ${bamboo_repository_name}/${bamboo_repository_branch_name}:${bamboo_repository_revision_number} \
    -t cpowers/${bamboo_repository_name}-${bamboo_repository_branch_name}:${bamboo_repository_revision_number} \
    .

# Find and extract the test & coverage output
docker create --name testcontainer $(docker images --filter "label=layer=${bamboo_repository_name}/${bamboo_repository_branch_name}" -q | head -1)
docker cp testcontainer:/app/coverage ./
rm -f mocha.json
docker cp testcontainer:/app/mocha.json ./
docker rm testcontainer

# Push the docker image
docker push cpowers/${bamboo_repository_name}-${bamboo_repository_branch_name}:${bamboo_repository_revision_number}

# Apply the kubernetes deployment
kubectl apply -f deployment.yaml
kubectl rollout status -w --timeout=10m deployment/${bamboo_repository_name}-${bamboo_repository_branch_name}