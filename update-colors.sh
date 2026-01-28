#!/bin/bash

# Script to update color scheme from purple/blue to white/gold

echo "🎨 Updating color scheme to white/gold..."

# Find all TypeScript/TSX files in src directory
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Create backup
  cp "$file" "$file.bak"

  # Replace purple-to-blue gradients with amber-to-gold gradients
  sed -i '' 's/from-purple-600 to-blue-600/from-amber-400 to-yellow-500/g' "$file"
  sed -i '' 's/from-purple-700 to-blue-700/from-amber-500 to-yellow-600/g' "$file"
  sed -i '' 's/from-purple-400 to-blue-400/from-amber-200 via-yellow-400 to-amber-200/g' "$file"
  sed -i '' 's/from-purple-500 to-pink-500/from-amber-300 to-yellow-400/g' "$file"
  sed -i '' 's/from-purple-600 to-pink-600/from-amber-400 to-yellow-500/g' "$file"
  sed -i '' 's/from-purple-700 to-pink-700/from-amber-500 to-yellow-600/g' "$file"

  # Replace zinc colors with black/white/gray
  sed -i '' 's/bg-zinc-950/bg-black/g' "$file"
  sed -i '' 's/bg-zinc-900/bg-zinc-950/g' "$file"
  sed -i '' 's/bg-zinc-800/bg-zinc-900/g' "$file"
  sed -i '' 's/text-zinc-50/text-white/g' "$file"
  sed -i '' 's/text-zinc-100/text-white/g' "$file"
  sed -i '' 's/text-zinc-200/text-gray-200/g' "$file"
  sed -i '' 's/text-zinc-300/text-gray-300/g' "$file"
  sed -i '' 's/text-zinc-400/text-gray-400/g' "$file"
  sed -i '' 's/hover:text-zinc-100/hover:text-amber-400/g' "$file"
  sed -i '' 's/border-zinc-800/border-zinc-900/g' "$file"
  sed -i '' 's/border-zinc-700/border-zinc-800/g' "$file"

  # Replace purple/blue solid colors with gold
  sed -i '' 's/bg-purple-600/bg-amber-500/g' "$file"
  sed -i '' 's/bg-purple-500/bg-amber-400/g' "$file"
  sed -i '' 's/bg-blue-600/bg-yellow-500/g' "$file"
  sed -i '' 's/bg-blue-500/bg-yellow-400/g' "$file"
  sed -i '' 's/text-purple-400/text-amber-400/g' "$file"
  sed -i '' 's/text-purple-500/text-amber-500/g' "$file"
  sed -i '' 's/text-blue-400/text-yellow-400/g' "$file"
  sed -i '' 's/text-blue-500/text-yellow-500/g' "$file"
  sed -i '' 's/border-purple-500/border-amber-500/g' "$file"
  sed -i '' 's/border-blue-500/border-yellow-500/g' "$file"

  # Purple/blue hover states to gold
  sed -i '' 's/hover:bg-purple-700/hover:bg-amber-600/g' "$file"
  sed -i '' 's/hover:bg-blue-700/hover:bg-yellow-600/g' "$file"

  # Shadow colors
  sed -i '' 's/shadow-purple-500/shadow-amber-500/g' "$file"
  sed -i '' 's/shadow-blue-500/shadow-yellow-500/g' "$file"

  echo "  ✓ Updated $file"
done

echo "✅ Color scheme update complete!"
echo "💾 Backups saved with .bak extension"
