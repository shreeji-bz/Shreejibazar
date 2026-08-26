#!/bin/bash
echo "Running tests..."
cd backend && npm test
cd ../admin && npm test
cd ../mobile && flutter test
echo "Tests complete."
