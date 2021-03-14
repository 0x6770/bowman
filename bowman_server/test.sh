#!/bin/bash

set -e

URL="http://localhost:8080"
ID=
NAME=
ANGLE=

read -p "Please Enter Your Name: " NAME

ID=$(curl -s -X POST -H 'Content-Type: application/json' "${URL}/join" \
  -d '{"name":"'"${NAME}"'"}' | jq '.id')

echo "${ID}"

echo "TEST: adjust the angle to 60 degrees"
curl -s -X POST -H 'Content-Type: application/json' "${URL}/angle" \
  -d '{"id":'"${ID}"',"angle":60}'

echo "TEST: fire an arrow of angle 20 degrees and velocity 40"
curl -s -X POST -H 'Content-Type: application/json' "${URL}/fire" \
  -d '{"id":'"${ID}"',"angle":20,"velocity":40}'

