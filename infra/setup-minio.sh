#!/bin/bash
# ===========================================================
# MinIO Setup Script — Tume ya Utumishi Serikalini
# ===========================================================
# Run this script on VM 3 to install and configure MinIO.
# This script must be run as root or with sudo.
# ===========================================================

set -euo pipefail

MINIO_VERSION="latest"
MINIO_USER="minio-user"
MINIO_GROUP="minio-group"
MINIO_DIR="/opt/minio"
MINIO_DATA_DIR="/opt/minio/data"
MINIO_CONFIG_DIR="/opt/minio/config"
MINIO_BUCKET="tume-web-assets"

echo "========================================="
echo " MinIO Setup — Tume ya Utumishi Serikalini"
echo "========================================="

# 1. Create MinIO user and group
echo "Creating MinIO user..."
id -u $MINIO_USER &>/dev/null || useradd -r -s /sbin/nologin $MINIO_USER

# 2. Create directories
echo "Creating directories..."
mkdir -p $MINIO_DATA_DIR
mkdir -p $MINIO_CONFIG_DIR

# 3. Download and install MinIO binary
echo "Downloading MinIO server..."
curl -sL https://dl.min.io/server/minio/release/linux-amd64/minio -o /usr/local/bin/minio
chmod +x /usr/local/bin/minio

# 4. Download and install MinIO client (mc)
echo "Downloading MinIO client (mc)..."
curl -sL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc
chmod +x /usr/local/bin/mc

# 5. Create environment file
echo "Creating environment file..."
cat > $MINIO_CONFIG_DIR/env << 'ENVEOF'
# MinIO Environment
MINIO_ROOT_USER=minio_access_key
MINIO_ROOT_PASSWORD=minio_secret_key
MINIO_BROWSER=on
ENVEOF

# Set secure permissions
chmod 600 $MINIO_CONFIG_DIR/env
chown -R $MINIO_USER:$MINIO_GROUP $MINIO_DIR

# 6. Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/minio.service << 'SERVICEEOF'
[Unit]
Description=MinIO Object Storage Server
After=network.target

[Service]
Type=simple
User=minio-user
Group=minio-group
EnvironmentFile=/opt/minio/config/env
ExecStart=/usr/local/bin/minio server /opt/minio/data --console-address ":9001"
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
SERVICEEOF

# 7. Enable and start MinIO
echo "Starting MinIO service..."
systemctl daemon-reload
systemctl enable minio
systemctl start minio

# 8. Wait for MinIO to be ready
echo "Waiting for MinIO to start..."
sleep 5

# 9. Create bucket
echo "Configuring MinIO client..."
mc alias set local http://localhost:9000 minio_access_key minio_secret_key --api s3v4

echo "Creating bucket: $MINIO_BUCKET..."
mc mb local/$MINIO_BUCKET --ignore-existing

# 10. Set bucket policy to allow public read
echo "Setting public read policy on bucket..."
mc anonymous set download local/$MINIO_BUCKET

echo ""
echo "========================================="
echo " MinIO setup complete!"
echo "========================================="
echo ""
echo " MinIO Server:    http://localhost:9000"
echo " MinIO Console:   http://localhost:9001"
echo " Access Key:      minio_access_key"
echo " Secret Key:      minio_secret_key"
echo " Bucket:          $MINIO_BUCKET"
echo ""
echo " IMPORTANT: Change the access key and secret key in:"
echo "   $MINIO_CONFIG_DIR/env"
echo "   And update the corresponding values in:"
echo "   - cms/.env (MINIO_KEY, MINIO_SECRET)"
echo "   - frontend/.env (no change needed)"
echo ""
echo " After changing credentials, restart MinIO:"
echo "   sudo systemctl restart minio"
echo "========================================="