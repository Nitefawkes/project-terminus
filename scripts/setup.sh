#!/bin/bash

# Project Terminus Development Setup Script

echo "🌍 Project Terminus - Development Setup"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Docker is recommended for local development."
else
    echo "✅ Docker found: $(docker --version)"
fi

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment files if they don't exist
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
    echo "⚠️  Please configure your Mapbox API key in frontend/.env.local"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo "⚠️  Please configure your environment variables in backend/.env"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables:"
echo "   - Add your Mapbox API key to frontend/.env.local"
echo "   - Update database credentials in backend/.env"
echo ""
echo "2. Start the development environment:"
echo "   - With Docker: docker-compose up -d"
echo "   - Without Docker: npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:3001"
echo "   - API Docs: http://localhost:3001/api/docs"
echo ""
echo "🌍 Welcome to Project Terminus!"
