#!/bin/bash

# Test script for the NodeWave Email API
echo "Testing NodeWave Email API..."

# Check if API is running
API_URL="https://nodewave-email.vercel.app/api/contact"

# Test payload
payload='{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "phone": "+1 (555) 123-4567",
  "subject": "Test Subject",
  "budget": "Under $10K",
  "message": "This is a test message from the API test script.",
  "newsletter": true
}'

echo "Sending test request to: $API_URL"
echo "Payload: $payload"
echo ""

# Send test request
response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "$API_URL")

# Extract HTTP status and body
http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed -E 's/HTTP_STATUS:[0-9]*$//')

echo "HTTP Status: $http_status"
echo "Response Body: $body"

if [ "$http_status" -eq 200 ]; then
    echo "✅ Test passed! Email API is working."
else
    echo "❌ Test failed! API returned status $http_status"
fi
