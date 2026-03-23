#!/bin/bash
# A simple script to build the project and run the dev server if the build succeeds.

# Navigate to the script's directory to ensure commands run in the right place
cd "$(dirname "$0")"

echo "🧪 Starting verification build..."

# Step 1: Run the build and capture the output
if npm run build; then
  # Step 2: If build succeeds, report success and start the dev server
  echo "✅ Build successful!"
  echo "🚀 Starting development server..."
  npm run dev
else
  # Step 3: If build fails, report the error and exit
  echo "❌ Build failed. Please check the errors above. Server will not start."
  exit 1
fi
