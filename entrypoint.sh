#!/bin/sh


# load_secret() {
#     secret_name=$1
#     env_var_name=$2
#     secret_value=$(cat /run/secrets/$secret_name 2>/dev/null)
    
#     if [ $? -eq 0 ]; then
#         export $env_var_name="$secret_value"
#         echo "Loaded $secret_name into $env_var_name with val $secret_value"
#     else
#         echo "Failed to load $secret_name" >&2
#     fi
# }

# load_secret "NEXT_PUBLIC_UPLOADTHING_APP_ID" "NEXT_PUBLIC_UPLOADTHING_APP_ID"
# load_secret "UPLOADTHING_SECRET" "UPLOADTHING_SECRET"
# load_secret "DB_URL" "DB_URL"
# load_secret "POSTGRES_DB" "POSTGRES_DB"
# load_secret "POSTGRES_USER" "POSTGRES_USER"
# load_secret "POSTGRES_PASSWORD" "POSTGRES_PASSWORD"



# VARIABLES="NEXT_PUBLIC_UPLOADTHING_APP_ID UPLOADTHING_SECRET DB_URL"

# for VAR in $VARIABLES; do
#     eval value=\$$VAR
#     if [ -z "$value" ]; then
#         echo "$VAR is not set. Please set it and rerun the script."
#         exit 1
#     fi
# done

# find /app/public /app/.next -type f -name "*.js" | while read -r file; do
#     for VAR in $VARIABLES; do
#         eval value=\$$VAR
#         sed -i "s|BAKED_$VAR|$value|g" "$file"
#     done
# done

# exec NODE_ENV=production HOST=0.0.0.0 HOSTNAME=0.0.0.0 PORT=3000 node server.js

export NEXT_PUBLIC_UPLOADTHING_APP_ID=$(cat /run/secrets/NEXT_PUBLIC_UPLOADTHING_APP_ID)
export UPLOADTHING_SECRET=$(cat /run/secrets/UPLOADTHING_SECRET)
export DB_URL=$(cat /run/secrets/DB_URL)
export POSTGRES_DB=$(cat /run/secrets/POSTGRES_DB)
export POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER)
export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD)

echo "NEXT_PUBLIC_UPLOADTHING_APP_ID: $NEXT_PUBLIC_UPLOADTHING_APP_ID"
echo "UPLOADTHING_SECRET: $UPLOADTHING_SECRET"
echo "DB_URL: $DB_URL"
echo "POSTGRES_DB: $POSTGRES_DB"
echo "POSTGRES_USER: $POSTGRES_USER"

exec "$@"