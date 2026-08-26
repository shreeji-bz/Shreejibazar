#!/bin/bash
echo "Building all services..."
cd backend && npm run build
cd ../admin && npm run build
echo "Build complete."
