#!/bin/bash

echo "Setting up AzniT e-commerce website..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create necessary directories if they don't exist
echo "Creating necessary directories..."
mkdir -p public/images

# Install specific packages if needed
echo "Installing additional packages..."
npm install --save react-icons @heroicons/react next-themes

# Build the project
echo "Building the project..."
npm run build

echo "Setup complete! You can now run the development server with:"
echo "npm run dev" 