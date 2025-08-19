import nodemailer from 'nodemailer';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Debug logging function
function debugLog(level, message, data = null) {
  const isDebugMode = process.env.DEBUG_APP === 'true' || process.env.DEBUG_APP === '1';

  if (!isDebugMode) return;

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.log(logMessage);
  }
}

// Input validation function
function validateInput(body) {
  debugLog('info', 'Starting input validation', { bodyKeys: Object.keys(body) });

  const { firstName, lastName, email, subject, message } = body;

  // firstName and lastName are required
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    debugLog('error', 'Validation failed: firstName is required', { firstName });
    return { isValid: false, error: 'First name is required' };
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    debugLog('error', 'Validation failed: lastName is required', { lastName });
    return { isValid: false, error: 'Last name is required' };
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    debugLog('error', 'Validation failed: invalid email', { email, emailValid: emailRegex.test(email?.trim() || '') });
    return { isValid: false, error: 'Valid email is required' };
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    debugLog('error', 'Validation failed: subject is required', { subject });
    return { isValid: false, error: 'Subject is required' };
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    debugLog('error', 'Validation failed: message is required', { message: message?.substring(0, 50) + '...' });
    return { isValid: false, error: 'Message is required' };
  }

  // Optional field validations
  const { phone, budget } = body;
  if (phone && typeof phone !== 'string') {
    debugLog('error', 'Validation failed: phone must be string', { phone, phoneType: typeof phone });
    return { isValid: false, error: 'Phone must be a valid string' };
  }

  if (budget && typeof budget !== 'string') {
    debugLog('error', 'Validation failed: budget must be string', { budget, budgetType: typeof budget });
    return { isValid: false, error: 'Budget must be a valid string' };
  }

  debugLog('info', 'Input validation successful', {
    firstName: firstName.substring(0, 20),
    lastName: lastName.substring(0, 20),
    email,
    subject: subject.substring(0, 50),
    hasPhone: !!phone,
    hasBudget: !!budget
  });

  return { isValid: true };
}// Create transporter based on environment variables
function createTransporter() {
  debugLog('info', 'Creating email transporter');

  const {
    EMAIL_SERVICE,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS
  } = process.env;

  debugLog('debug', 'Environment variables loaded', {
    EMAIL_SERVICE,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER: EMAIL_USER ? `${EMAIL_USER.substring(0, 3)}***@${EMAIL_USER.split('@')[1]}` : 'undefined',
    EMAIL_PASS: EMAIL_PASS ? `***${EMAIL_PASS.substring(EMAIL_PASS.length - 3)}` : 'undefined'
  });

  if (!EMAIL_USER || !EMAIL_PASS) {
    debugLog('error', 'Missing required email credentials', {
      hasEmailUser: !!EMAIL_USER,
      hasEmailPass: !!EMAIL_PASS
    });
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
  }

  let config = {
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  };

  if (EMAIL_SERVICE && EMAIL_SERVICE.toLowerCase() !== 'smtp') {
    // Use predefined service (gmail, outlook, etc.)
    config.service = EMAIL_SERVICE;
    debugLog('info', 'Using predefined email service', { service: EMAIL_SERVICE });
  } else {
    // Use custom SMTP configuration
    if (!EMAIL_HOST) {
      debugLog('error', 'EMAIL_HOST required for custom SMTP but not provided');
      throw new Error('EMAIL_HOST is required when using custom SMTP');
    }
    config.host = EMAIL_HOST;
    config.port = EMAIL_PORT ? parseInt(EMAIL_PORT, 10) : 587;
    config.secure = config.port === 465; // true for 465, false for other ports
    debugLog('info', 'Using custom SMTP configuration', {
      host: EMAIL_HOST,
      port: config.port,
      secure: config.secure
    });
  }

  // Add additional debugging options for Gmail
  if (EMAIL_SERVICE?.toLowerCase() === 'gmail') {
    config.debug = process.env.DEBUG_APP === 'true';
    config.logger = process.env.DEBUG_APP === 'true';
  }

  debugLog('info', 'Final transporter config', {
    service: config.service,
    host: config.host,
    port: config.port,
    secure: config.secure,
    hasAuth: !!(config.auth.user && config.auth.pass)
  });

  const transporter = nodemailer.createTransport(config);

  // Verify transporter configuration
  if (process.env.DEBUG_APP === 'true') {
    transporter.verify((error, success) => {
      if (error) {
        debugLog('error', 'Transporter verification failed', { error: error.message });
      } else {
        debugLog('info', 'Transporter verification successful', { success });
      }
    });
  }

  return transporter;
}

// Main handler function
export default async function handler(req, res) {
  debugLog('info', 'API request received', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent']?.substring(0, 50),
    origin: req.headers.origin,
    contentType: req.headers['content-type']
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    debugLog('info', 'Handling CORS preflight request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    debugLog('warn', 'Method not allowed', { method: req.method });
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.'
    });
  }

  try {
    debugLog('info', 'Processing POST request', {
      bodySize: JSON.stringify(req.body || {}).length,
      hasBody: !!req.body
    });

    // Validate input
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      debugLog('warn', 'Input validation failed', { error: validation.error });
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const { firstName, lastName, email, phone, subject, budget, message, newsletter } = req.body;
    const fullName = `${firstName} ${lastName}`.trim();
    const emailTo = process.env.EMAIL_TO;

    debugLog('info', 'Processing email send request', {
      fullName,
      senderEmail: email,
      subject,
      emailTo,
      hasPhone: !!phone,
      hasBudget: !!budget,
      isNewsletterSubscribed: !!newsletter,
      messageLength: message?.length
    });

    if (!emailTo) {
      debugLog('error', 'EMAIL_TO environment variable not set');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: EMAIL_TO not set'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: `"${fullName}" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      subject: `NodeWave Contact: ${subject}`,
      text: `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}
${budget ? `Budget Range: ${budget}` : ''}
${newsletter ? 'Newsletter Subscription: Yes' : ''}

Message:
${message}

Timestamp: ${new Date().toLocaleString()}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            ${budget ? `<p><strong>Budget Range:</strong> ${budget}</p>` : ''}
            ${newsletter ? '<p><strong>Newsletter:</strong> <span style="color: #28a745;">✓ Subscribed</span></p>' : ''}
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <p style="background-color: #ffffff; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          <div style="margin: 20px 0;">
            <p style="color: #6c757d; font-size: 14px;">
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px;">
            This message was sent from the NodeWave contact form at ${req.headers.origin || 'nodewave.com'}.
          </p>
        </div>
      `,
      replyTo: email
    };

    debugLog('info', 'Email options prepared', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo,
      textLength: mailOptions.text.length,
      htmlLength: mailOptions.html.length
    });

    // Send email
    debugLog('info', 'Attempting to send email...');
    const startTime = Date.now();

    const result = await transporter.sendMail(mailOptions);

    const endTime = Date.now();
    debugLog('info', 'Email sent successfully', {
      duration: `${endTime - startTime}ms`,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      pending: result.pending,
      response: result.response
    });

    // Success response
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      ...(process.env.DEBUG_APP === 'true' && {
        debug: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
          response: result.response
        }
      })
    });

  } catch (error) {
    debugLog('error', 'Email sending failed', {
      errorMessage: error.message,
      errorCode: error.code,
      errorCommand: error.command,
      errorResponse: error.response,
      errorStack: process.env.DEBUG_APP === 'true' ? error.stack : undefined
    });

    // Return appropriate error message
    let errorMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed - check your credentials';
      debugLog('error', 'Authentication error details', {
        user: process.env.EMAIL_USER,
        service: process.env.EMAIL_SERVICE
      });
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Failed to connect to email server - check your network';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid email addresses';
    } else if (error.responseCode) {
      errorMessage = `Email server error: ${error.responseCode}`;
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      ...(process.env.DEBUG_APP === 'true' && {
        debug: {
          originalError: error.message,
          code: error.code,
          command: error.command,
          response: error.response
        }
      })
    });
  }
}
