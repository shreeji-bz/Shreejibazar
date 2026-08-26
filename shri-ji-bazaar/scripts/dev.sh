#!/bin/bash
echo "Starting development environment..."
docker-compose up -d postgres redis
echo "Database and Redis started."
