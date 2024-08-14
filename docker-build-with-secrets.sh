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



docker build \
  --secret id=NEXT_PUBLIC_UPLOADTHING_APP_ID,src=secrets/NEXT_PUBLIC_UPLOADTHING_APP_ID \
  --secret id=UPLOADTHING_SECRET,src=secrets/UPLOADTHING_SECRET \
  --secret id=DB_URL,src=secrets/DB_URL \
  --secret id=POSTGRES_DB,src=secrets/POSTGRES_DB \
  --secret id=POSTGRES_USER,src=secrets/POSTGRES_USER \
  --secret id=POSTGRES_PASSWORD,src=secrets/POSTGRES_PASSWORD \
  -t deadspace-web-ui .

# rm -rf secrets