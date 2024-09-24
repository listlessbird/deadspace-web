#!/bin/bash

# Set environment variables
DOCKER_IMAGE_NAME="deadspace-web-ui"
ENV_FILE=".env.production"
SECRETS_DIR="secrets"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists docker; then
    echo "Error: Docker is not installed. Please install Docker and try again."
    exit 1
fi

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

# Build Docker image
echo "Building Docker image..."
DOCKER_BUILDKIT=1 docker build \
    --secret id=NEXT_PUBLIC_UPLOADTHING_APP_ID,src="$SECRETS_DIR/NEXT_PUBLIC_UPLOADTHING_APP_ID" \
    --secret id=UPLOADTHING_SECRET,src="$SECRETS_DIR/UPLOADTHING_SECRET" \
    --secret id=DB_URL,src="$SECRETS_DIR/DB_URL" \
    --secret id=POSTGRES_DB,src="$SECRETS_DIR/POSTGRES_DB" \
    --secret id=POSTGRES_USER,src="$SECRETS_DIR/POSTGRES_USER" \
    --secret id=POSTGRES_PASSWORD,src="$SECRETS_DIR/POSTGRES_PASSWORD" \
    --secret id=GOOGLE_AUTH_CLIENT_ID,src="$SECRETS_DIR/GOOGLE_AUTH_CLIENT_ID" \
    --secret id=GOOGLE_AUTH_CLIENT_SECRET,src="$SECRETS_DIR/GOOGLE_AUTH_CLIENT_SECRET" \
    --secret id=NEXT_PUBLIC_BASE_URL,src="$SECRETS_DIR/NEXT_PUBLIC_BASE_URL" \
    -t "$DOCKER_IMAGE_NAME" .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Error: Docker build failed. Please check the build output for errors."
    exit 1
fi

# Run Docker container
echo "Running Docker container..."
docker run -d \
    -p 3000:3000 \
    $(while IFS='=' read -r key value
    do
        if [[ -n "$key" && -n "$value" ]]; then
            echo -n "-e $key=$(cat "$SECRETS_DIR/$key") "
        fi
    done < "$ENV_FILE") \
    "$DOCKER_IMAGE_NAME"

# Check if container started successfully
if [ $? -ne 0 ]; then
    echo "Error: Failed to start Docker container. Please check the Docker logs for more information."
    exit 1
fi

echo "Docker container started successfully. You can access the application at http://localhost:3000"

# Optionally, remove the secrets directory
# Uncomment the following line if you want to remove the secrets after running
# rm -rf "$SECRETS_DIR"

echo "Script completed successfully."