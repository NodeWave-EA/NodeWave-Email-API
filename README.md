# NodeWave Email API

A serverless email API built with Nodemailer for Vercel deployment.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - Set your email service credentials
   - Configure recipient email address

## Development

Run locally with Vercel CLI:

```bash
npm run dev
```

Or install Vercel CLI globally and run:

```bash
vercel dev
```

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

## API Endpoints

### POST /api/contact

Send a contact form email.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I'm interested in your IoT solutions."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variables

Set these in your Vercel dashboard or `.env` file:

| Variable        | Description                         | Example                    |
| --------------- | ----------------------------------- | -------------------------- |
| `EMAIL_SERVICE` | Email service provider              | `gmail`, `outlook`, `smtp` |
| `EMAIL_HOST`    | SMTP host (if using custom SMTP)    | `smtp.gmail.com`           |
| `EMAIL_PORT`    | SMTP port (if using custom SMTP)    | `587`                      |
| `EMAIL_USER`    | Email account username              | `your-email@gmail.com`     |
| `EMAIL_PASS`    | Email account password/app password | `your-app-password`        |
| `EMAIL_TO`      | Recipient email address             | `contact@nodewave.com`     |

## Security Notes

- Never commit `.env` files with real credentials
- Use app passwords for Gmail/Outlook
- Set environment variables in Vercel dashboard for production
