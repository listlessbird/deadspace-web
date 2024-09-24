
#!/bin/bash

DOCKER_IMAGE_NAME="deadspace-web-ui"
ENV_FILE=".env.production"
SECRETS_DIR="secrets"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE file not found!"
    exit 1
fi


mkdir -p "$SECRETS_DIR"

echo "Creating secret files..."
while IFS='=' read -r key value
do
    if [[ -z "$key" || -z "$value" ]]; then
        continue
    fi
    echo "Writing $key to $SECRETS_DIR/"
    echo -n "$value" > "$SECRETS_DIR/$key"
done < "$ENV_FILE"

echo "Starting Docker Compose..."

docker-compose down
docker-compose -f compose.prod.yml up -d
