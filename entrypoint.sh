#!/bin/sh

# export NEXT_PUBLIC_UPLOADTHING_APP_ID=$(cat /run/secrets/NEXT_PUBLIC_UPLOADTHING_APP_ID)
# export UPLOADTHING_SECRET=$(cat /run/secrets/UPLOADTHING_SECRET)
# export DB_URL=$(cat /run/secrets/DB_URL)
# export POSTGRES_DB=$(cat /run/secrets/POSTGRES_DB)
# export POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER)
# export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD)

export NEXT_PUBLIC_UPLOADTHING_APP_ID=$(cat /run/secrets/NEXT_PUBLIC_UPLOADTHING_APP_ID | tr -d '\r')
export UPLOADTHING_SECRET=$(cat /run/secrets/UPLOADTHING_SECRET | tr -d '\r')
export DB_URL=$(cat /run/secrets/DB_URL | tr -d '\r')
export POSTGRES_DB=$(cat /run/secrets/POSTGRES_DB | tr -d '\r')
export POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER | tr -d '\r')
export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD | tr -d '\r')
export GOOGLE_AUTH_CLIENT_ID=$(cat /run/secrets/GOOGLE_AUTH_CLIENT_ID | tr -d '\r')
export GOOGLE_AUTH_CLIENT_SECRET=$(cat /run/secrets/GOOGLE_AUTH_CLIENT_SECRET | tr -d '\r')
export NEXT_PUBLIC_BASE_URL=$(cat /run/secrets/NEXT_PUBLIC_BASE_URL | tr -d '\r')

echo "NEXT_PUBLIC_UPLOADTHING_APP_ID: $NEXT_PUBLIC_UPLOADTHING_APP_ID"
echo "UPLOADTHING_SECRET: $UPLOADTHING_SECRET"
echo "DB_URL: $DB_URL"
echo "POSTGRES_DB: $POSTGRES_DB"
echo "POSTGRES_USER: $POSTGRES_USER"
echo "GOOGLE_AUTH_CLIENT_ID: $GOOGLE_AUTH_CLIENT_ID"
echo "GOOGLE_AUTH_CLIENT_SECRET: $GOOGLE_AUTH_CLIENT_SECRET"
echo "NEXT_PUBLIC_BASE_URL: $NEXT_PUBLIC_BASE_URL"

exec "$@"