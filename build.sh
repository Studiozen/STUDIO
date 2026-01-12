#!/bin/bash
set -e

echo "Starting build process..."

# Installa dipendenze
echo "Installing dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

# Build
echo "Building application..."
npm run build

echo "Build completed successfully!"
