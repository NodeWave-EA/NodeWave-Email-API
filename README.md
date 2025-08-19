# NodeWave Email API

A comprehensive serverless email API built with Nodemailer for Vercel deployment. This API handles contact form submissions from the NodeWave Vue.js frontend with advanced debugging, validation, and multiple email service support.

## 🚀 Features

- ✅ **Serverless Architecture** - Zero-config deployment to Vercel
- ✅ **Multiple Email Services** - Gmail, Outlook, Yahoo, or custom SMTP
- ✅ **Comprehensive Validation** - Input sanitization and error handling
- ✅ **Debug Mode** - Advanced logging controlled by environment variables
- ✅ **CORS Support** - Ready for frontend integration
- ✅ **HTML & Text Emails** - Professional email templates
- ✅ **Security First** - No credentials in code, environment-based config

## 📁 Project Structure

```
nodewave_email/
├── api/
│   └── contact.js          # Main serverless function
├── public/                 # Static assets (required by Vercel)
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
├── .env.example          # Environment variables template
├── .env                  # Local development config (git-ignored)
├── .gitignore           # Git ignore patterns
├── test-api.sh          # API testing script
└── README.md
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your email service credentials:

```bash
# Email Service Configuration
EMAIL_SERVICE=gmail                    # gmail, outlook, yahoo, or smtp
EMAIL_USER=your-email@gmail.com       # Your email address
EMAIL_PASS=your-app-password          # App password (not regular password)
EMAIL_TO=contact@nodewave.com         # Recipient email address

# Optional: Custom SMTP (if EMAIL_SERVICE=smtp)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587

# Debug Mode (optional)
DEBUG_APP=false                       # Set to 'true' for detailed logging
```

### 3. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. Use the generated 16-character password in `EMAIL_PASS`

## 🚀 Development

### Local Development

```bash
# Start local development server
npm run dev
# or
vercel dev
```

The API will be available at `http://localhost:3000/api/contact`

### Testing

```bash
# Run the test script
./test-api.sh

# Or test manually with curl
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "subject": "Test Subject",
    "budget": "Under $10K",
    "message": "This is a test message.",
    "newsletter": true
  }'
```

## 🌐 Deployment

### Deploy to Vercel

```bash
vercel --prod
```

### Set Production Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add all required environment variables:

| Variable        | Value                  | Environment                              |
| --------------- | ---------------------- | ---------------------------------------- |
| `EMAIL_SERVICE` | `gmail`                | Production, Preview, Development         |
| `EMAIL_USER`    | `your-email@gmail.com` | Production, Preview, Development         |
| `EMAIL_PASS`    | `your-app-password`    | Production, Preview, Development         |
| `EMAIL_TO`      | `contact@nodewave.com` | Production, Preview, Development         |
| `DEBUG_APP`     | `false`                | Production (set to `true` for debugging) |

## 📡 API Reference

### POST `/api/contact`

Sends a contact form email with comprehensive validation and error handling.

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "subject": "General Inquiry",
  "budget": "Under $10K",
  "message": "Hello, I'm interested in your IoT solutions.",
  "newsletter": true
}
```

#### Required Fields

- `firstName` (string): Contact's first name
- `lastName` (string): Contact's last name
- `email` (string): Valid email address
- `subject` (string): Subject of the inquiry
- `message` (string): Message content (minimum 1 character)

#### Optional Fields

- `phone` (string): Phone number
- `budget` (string): Budget range selection
- `newsletter` (boolean): Newsletter subscription preference

#### Success Response (200)

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**With Debug Mode:**

```json
{
  "success": true,
  "message": "Email sent successfully",
  "debug": {
    "messageId": "<unique-message-id>",
    "accepted": ["contact@nodewave.com"],
    "rejected": [],
    "response": "250 Message accepted"
  }
}
```

#### Error Responses

**Validation Error (400):**

```json
{
  "success": false,
  "error": "First name is required"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "error": "Email authentication failed - check your credentials"
}
```

**With Debug Mode:**

```json
{
  "success": false,
  "error": "Email authentication failed - check your credentials",
  "debug": {
    "originalError": "Invalid login: 535-5.7.8 Username and Password not accepted",
    "code": "EAUTH",
    "command": "AUTH LOGIN"
  }
}
```

## 🔧 Environment Variables

| Variable        | Description                         | Required                | Example                             |
| --------------- | ----------------------------------- | ----------------------- | ----------------------------------- |
| `EMAIL_SERVICE` | Email service provider              | ✅                      | `gmail`, `outlook`, `yahoo`, `smtp` |
| `EMAIL_USER`    | Email account username              | ✅                      | `your-email@gmail.com`              |
| `EMAIL_PASS`    | Email account password/app password | ✅                      | `abcdefghijklmnop`               |
| `EMAIL_TO`      | Recipient email address             | ✅                      | `your-email@gmail.com`              |
| `EMAIL_HOST`    | SMTP host (for custom SMTP)         | If `EMAIL_SERVICE=smtp` | `smtp.gmail.com`                    |
| `EMAIL_PORT`    | SMTP port (for custom SMTP)         | If `EMAIL_SERVICE=smtp` | `587`                               |
| `DEBUG_APP`     | Enable comprehensive logging        | ❌                      | `true` or `false`                   |


## 📋 Testing

### Manual Testing

```bash
# Test with all fields
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1 (555) 123-4567",
    "subject": "API Test",
    "budget": "Under $10K",
    "message": "This is a comprehensive test of the API.",
    "newsletter": true
  }'

# Test validation errors
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "",
    "email": "invalid-email"
  }'
```

### Automated Testing

```bash
# Run the included test script
./test-api.sh
```

## 🤝 Integration

### Vue.js Frontend Integration

1. Set the API URL in your Vue.js environment:

   ```bash
   # .env.local
   VITE_EMAIL_API_URL=https://your-api.vercel.app/api/contact
   ```
