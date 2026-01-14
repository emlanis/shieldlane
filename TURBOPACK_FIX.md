# Turbopack Permission Error Fix

## Problem

Next.js/Turbopack is detecting a lockfile at `/Users/emlanis/package-lock.json` and inferring that `/Users/emlanis` is the workspace root. When it tries to scan `/Users/emlanis/Documents`, macOS denies permission (this is a security feature).

Error message:
```
Error [TurbopackInternalError]: reading dir /Users/emlanis/Documents
Caused by:
- Operation not permitted (os error 1)
```

## Solutions (Pick ONE)

### Solution 1: Remove the Rogue Lockfile (RECOMMENDED)

The lockfile at `/Users/emlanis/package-lock.json` is likely from an old project. Remove or rename it:

```bash
mv /Users/emlanis/package-lock.json /Users/emlanis/package-lock.json.backup
```

Then restart the dev server:
```bash
cd ~/Documents/shieldlane/app
yarn dev
```

### Solution 2: Grant Terminal Full Disk Access

1. Open System Settings → Privacy & Security → Full Disk Access
2. Click the `+` button
3. Add your Terminal app (Terminal.app or iTerm.app or VS Code)
4. Restart Terminal
5. Run `yarn dev` again

### Solution 3: Move Project Out of Documents Folder

macOS has special protections for the Documents folder:

```bash
mv ~/Documents/shieldlane ~/shieldlane
cd ~/shieldlane/app
yarn dev
```

## Why This Happens

Next.js 16 with Turbopack scans upward from your project to find package.json/lockfiles to determine the workspace root. It found `/Users/emlanis/package-lock.json` and assumed that's the root, which means it tries to scan everything below it, including the protected Documents folder.

## After Fixing

Once you apply any of the solutions above, the dev server should start successfully at `http://localhost:3000`.
