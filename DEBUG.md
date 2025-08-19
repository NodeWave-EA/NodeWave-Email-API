# Debug Guide for NodeWave Email API

## Enabling Debug Mode

Set the environment variable:

```bash
DEBUG_APP=true
```

## Debug Features

### 1. **Comprehensive Logging**

When `DEBUG_APP=true`, the API logs:

- Request details (method, headers, body size)
- Input validation steps
- Environment variable status (with masked credentials)
- Email transporter configuration
- Email send attempts with timing
- SMTP server responses
- Detailed error information

### 2. **Enhanced Error Messages**

- Authentication errors with credential hints
- SMTP connection issues with network details
- Email server response codes
- Stack traces for development

### 3. **Response Debug Data**

Success responses include debug information:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "debug": {
    "messageId": "unique-message-id",
    "accepted": ["recipient@example.com"],
    "rejected": [],
    "response": "250 OK"
  }
}
```

Error responses include debug information:

```json
{
  "success": false,
  "error": "User friendly error message",
  "debug": {
    "originalError": "Technical error details",
    "code": "EAUTH",
    "command": "AUTH LOGIN",
    "response": "535 Authentication failed"
  }
}
```

## Common Issues and Debug Interpretation

### 1. **Authentication Issues**

**Debug logs show:**

```
[ERROR] Authentication error details { user: "tes***@gmail.com", service: "gmail" }
```

**Possible causes:**

- Incorrect app password
- 2FA not enabled on Gmail
- Using regular password instead of app password

### 2. **Email Not Delivered**

**Debug logs show successful send:**

```
[INFO] Email sent successfully {
  messageId: "xxx",
  accepted: ["contact@nodewave.com"],
  rejected: [],
  response: "250 OK"
}
```

**Possible causes:**

- Email in spam folder
- Gmail security filters
- Recipient email server issues

### 3. **Connection Issues**

**Debug logs show:**

```
[ERROR] Failed to send email { errorCode: "ECONNECTION" }
```

**Possible causes:**

- Network connectivity issues
- Firewall blocking SMTP ports
- Incorrect SMTP settings

## Testing with Debug Mode

### 1. **Local Testing**

```bash
# Enable debug mode in .env
DEBUG_APP=true

# Start server
vercel dev

# Send test request and watch logs
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User",...}'
```

### 2. **Production Debugging**

Set `DEBUG_APP=true` in Vercel dashboard environment variables.

**⚠️ Warning:** Disable debug mode in production after troubleshooting as it logs sensitive information.

## Debug Log Levels

- **INFO**: Normal operation steps
- **DEBUG**: Configuration and setup details
- **WARN**: Non-critical issues
- **ERROR**: Failures and exceptions

## Security Notes

Debug mode logs include:

- Masked email credentials (first 3 and last 3 characters)
- Full email addresses and content
- SMTP server responses

**Always disable debug mode in production** to avoid logging sensitive data.

## Gmail-Specific Debugging

For Gmail service, debug mode enables:

- SMTP protocol logging
- Authentication flow details
- Server response parsing

## Troubleshooting Steps

1. **Enable debug mode**
2. **Send test email**
3. **Check debug logs for errors**
4. **Verify environment variables**
5. **Test authentication separately**
6. **Check email delivery (spam folder)**

## Advanced Debugging

### Custom SMTP Testing

```bash
# Test SMTP connection manually
telnet smtp.gmail.com 587

# Or use curl
curl -v --url 'smtps://smtp.gmail.com:465' \
  --mail-from 'your-email@gmail.com' \
  --mail-rcpt 'contact@nodewave.com' \
  --user 'your-email@gmail.com:your-app-password'
```

### Nodemailer Verification

The API automatically verifies the transporter configuration when debug mode is enabled:

```
[INFO] Transporter verification successful { success: true }
```

## Performance Monitoring

Debug mode tracks:

- Email send duration
- Response times
- Connection establishment time

Use this data to optimize performance and identify bottlenecks.
