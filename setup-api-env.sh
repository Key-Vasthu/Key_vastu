#!/bin/bash
# Setup API Environment Variables
# This script automatically adds VITE_API_URL to your .env file

ENV_FILE=".env"
API_URL="http://localhost:3001/api"

echo ""
echo "🔧 Setting up API configuration..."

# Check if .env file exists
if [ -f "$ENV_FILE" ]; then
    echo "✅ .env file found"
    
    # Check if VITE_API_URL already exists
    if grep -q "VITE_API_URL" "$ENV_FILE"; then
        echo "⚠️  VITE_API_URL already exists in .env file"
        echo "Current value:"
        grep "VITE_API_URL" "$ENV_FILE"
        
        read -p "Do you want to update it? (y/n) " update
        if [ "$update" = "y" ] || [ "$update" = "Y" ]; then
            # Remove existing VITE_API_URL line
            sed -i.bak '/VITE_API_URL=/d' "$ENV_FILE"
            # Add new VITE_API_URL
            echo "" >> "$ENV_FILE"
            echo "# API Configuration" >> "$ENV_FILE"
            echo "VITE_API_URL=$API_URL" >> "$ENV_FILE"
            echo "✅ Updated VITE_API_URL to $API_URL"
        else
            echo "ℹ️  Keeping existing VITE_API_URL"
        fi
    else
        # Add VITE_API_URL to existing file
        echo "" >> "$ENV_FILE"
        echo "# API Configuration" >> "$ENV_FILE"
        echo "VITE_API_URL=$API_URL" >> "$ENV_FILE"
        echo "✅ Added VITE_API_URL=$API_URL to .env file"
    fi
else
    echo "❌ .env file not found! Creating new .env file..."
    
    # Create new .env file with API configuration
    cat > "$ENV_FILE" << EOF
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
# DATABASE_URL=your_database_url_here

# API Configuration
VITE_API_URL=$API_URL
EOF
    
    echo "✅ Created .env file with API configuration"
fi

echo ""
echo "📝 Configuration:"
echo "VITE_API_URL=$API_URL"

echo ""
echo "📝 Next steps:"
echo "1. Make sure your backend server is running: npm run server"
echo "2. Restart your frontend dev server: npm run dev"
echo "3. The API will automatically use: $API_URL"
