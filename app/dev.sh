#!/bin/bash

# This script works around the Turbopack lockfile detection issue
# by explicitly setting the project root and preventing upward traversal

cd "$(dirname "$0")" || exit 1

# Export the project root to prevent Next.js from looking further up
export TURBOPACK_ROOT="$(pwd)"
export PROJECT_CWD="$(pwd)"

echo "Starting Shieldlane dev server..."
echo "Project root: $(pwd)"
echo ""

# Run Next.js dev server
exec yarn dev
