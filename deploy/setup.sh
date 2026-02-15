#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# 1. SWAP Configuration (CRITICAL for 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "Creating 4GB Swap file..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created."
else
    echo "Swap file already exists."
fi

# Adjust Swapiness (Prefer RAM over Swap)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER
    echo "Docker installed."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt install -y docker-compose-plugin
    # Alias for convenience
    echo 'alias docker-compose="docker compose"' >> ~/.bashrc
fi

# 3. Setup Firewall (UFW)
echo "Configuring Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Allow Application Ports if needed directly (optional, since we use Nginx on 80)
# sudo ufw allow 4040/tcp 
# sudo ufw allow 4080/tcp
sudo ufw --force enable

echo "Setup Complete! Please logout and login again for Docker group changes to take effect."
