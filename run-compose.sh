#!/bin/bash

mkdir -p secrets

if [ ! -f .env ]; then
  echo ".env file not found!"
  exit 1
fi

while IFS='=' read -r key value
do
  if [[ -z "$key" || -z "$value" ]]; then
    continue
  fi
  echo "Writing $key to secrets/"
  echo -n "$value" > secrets/"$key"
done < .env

docker-compose up --build

# rm -rf secrets

echo "cleaned up!"
