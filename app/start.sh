#!/bin/bash

# Shieldlane Startup Script
# Checks Node version and starts the development server

echo "🛡️  Shieldlane Development Server"
echo "================================"
echo ""

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
MINOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f2)

echo "Detected Node version: v$NODE_VERSION"

# Check if version is >= 20.9.0
if [ "$MAJOR_VERSION" -lt 20 ] || ([ "$MAJOR_VERSION" -eq 20 ] && [ "$MINOR_VERSION" -lt 9 ]); then
    echo ""
    echo "❌ ERROR: Node.js version 20.9.0 or higher is required"
    echo "   Current version: v$NODE_VERSION"
    echo ""
    echo "Solutions:"
    echo "  1. If using conda/miniconda:"
    echo "     conda activate base"
    echo "     node --version  # Should show v20.20.0"
    echo ""
    echo "  2. Using Homebrew:"
    echo "     brew upgrade node"
    echo ""
    echo "  3. Using nvm:"
    echo "     nvm install 20"
    echo "     nvm use 20"
    echo ""
    exit 1
fi

echo "✅ Node version OK"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local not found"
    echo "   Copying from .env.local.example..."
    cp .env.local.example .env.local
    echo "   Please edit .env.local and add your Helius API key"
    echo "   Get free key at: https://www.helius.dev/"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
    echo ""
fi

# Start the development server
echo "🚀 Starting development server..."
echo "   Visit: http://localhost:3000"
echo ""
yarn dev
