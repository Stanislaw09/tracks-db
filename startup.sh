#!/bin/bash
set -e

echo "🔐 Fetching DB_PASSWORD from Google Secret Manager..."

# Fetch secret
DB_PASSWORD=$(gcloud secrets versions access latest --secret=DB_PASSWORD)

# Write to temporary file for Docker secret
echo "$DB_PASSWORD" > ./db_password.txt
chmod 600 ./db_password.txt

echo "✅ Secret written to ./db_password.txt"

# Start containers
docker-compose up --build