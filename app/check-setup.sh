#!/bin/bash

echo "🔍 Shieldlane Setup Checker"
echo "============================"
echo ""

# Check for parent lockfiles
echo "Checking for lockfiles that might confuse Next.js..."
PARENT_LOCK=$(find /Users/emlanis -maxdepth 1 -name "package-lock.json" -o -name "yarn.lock" 2>/dev/null)

if [ -n "$PARENT_LOCK" ]; then
    echo "⚠️  WARNING: Found lockfile(s) in parent directory:"
    echo "$PARENT_LOCK"
    echo ""
    echo "This will cause Turbopack to fail with permission errors!"
    echo ""
    echo "To fix, run ONE of these commands:"
    echo ""
    echo "  Option 1 (Recommended): Rename the lockfile"
    echo "  $ mv /Users/emlanis/package-lock.json /Users/emlanis/package-lock.json.backup"
    echo ""
    echo "  Option 2: Move this project out of Documents folder"
    echo "  $ mv ~/Documents/shieldlane ~/shieldlane"
    echo ""
    echo "  Option 3: Grant Terminal Full Disk Access"
    echo "  System Settings → Privacy & Security → Full Disk Access → Add Terminal"
    echo ""
else
    echo "✓ No conflicting lockfiles found"
fi

# Check Node version
echo ""
echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Current version: $NODE_VERSION"

if [[ "$NODE_VERSION" == v20.* ]] || [[ "$NODE_VERSION" == v2[1-9].* ]] || [[ "$NODE_VERSION" == v[3-9]*.* ]]; then
    echo "✓ Node version is compatible (>= 20.9.0)"
else
    echo "⚠️  Node version may be too old. Requires >= 20.9.0"
fi

# Check if dependencies are installed
echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ] && [ -d "node_modules/next" ]; then
    echo "✓ Dependencies installed"
else
    echo "⚠️  Dependencies not installed. Run: yarn install"
fi

# Check for required environment variables
echo ""
echo "Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local exists"

    if grep -q "NEXT_PUBLIC_HELIUS_API_KEY=" .env.local; then
        HELIUS_KEY=$(grep "NEXT_PUBLIC_HELIUS_API_KEY=" .env.local | cut -d '=' -f2)
        if [ -n "$HELIUS_KEY" ]; then
            echo "  ✓ Helius API key configured"
        else
            echo "  ℹ️  Helius API key not set (optional, but recommended)"
        fi
    fi
else
    echo "⚠️  .env.local not found"
    echo "  Run: cp .env.local.example .env.local"
fi

echo ""
echo "============================"
echo "Setup check complete!"
