import path from 'path';
import fs from 'fs';
import pool from '../db.js';

// Get views folder path dynamically
const __dirname = path.resolve();
const LOGIN_PAGE_PATH = path.join(__dirname, 'src', 'views', 'login.html');

/**
 * Serves the beautiful login landing page
 */
export const getLoginPage = (req, res) => {
  try {
    const html = fs.readFileSync(LOGIN_PAGE_PATH, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error reading login.html:', error.message);
    res.status(500).send('<h3>Error loading login page</h3><p>Make sure backend/src/views/login.html exists.</p>');
  }
};

/**
 * Redirects the user to the Google OAuth consent page
 */
export const googleLogin = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || clientId.includes('your-google-client-id')) {
    return res.status(400).send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2 style="color: #ef4444;">Google Client ID is not configured</h2>
        <p>Please update <strong>GOOGLE_CLIENT_ID</strong> in your <code>backend/.env</code> file with valid Google Cloud Credentials.</p>
        <br/>
        <a href="/api/auth/login" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Return to Login</a>
      </div>
    `);
  }

  // Construct Google Auth URL
  const scope = 'openid profile email';
  const responseType = 'code';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&prompt=consent`;

  res.redirect(authUrl);
};

/**
 * Handles the redirect callback from Google OAuth, exchanges the auth code, and saves user to Neon
 */
export const googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code was not provided by Google.');
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(`Token Exchange Error: ${tokens.error_description || tokens.error}`);
    }

    // Retrieve user identity using access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const userInfo = await userInfoResponse.json();

    // Insert user into Database (schema.sql user design)
    const dbResult = await pool.query(
      `INSERT INTO users (full_name, email, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) 
       DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url
       RETURNING *`,
      [userInfo.name, userInfo.email, userInfo.picture]
    );

    const loggedInUser = dbResult.rows[0];

    // Return visual verification dashboard
    sendSuccessResponse(res, loggedInUser, 'Google Cloud OAuth 2.0');

  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).send(`
      <div style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #ef4444;">OAuth Authentication Failed</h2>
        <p>Could not authenticate with Google Cloud or store credentials in the database.</p>
        <p><strong>Details:</strong> <code>${error.message}</code></p>
        <br/>
        <a href="/api/auth/login" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Try Again</a>
      </div>
    `);
  }
};

/**
 * Developer Bypass Route: Creates or retrieves a local mock developer user to verify full database cycle
 */
export const mockLogin = async (req, res) => {
  try {
    // Insert mock developer user in users table
    const dbResult = await pool.query(
      `INSERT INTO users (full_name, email, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) 
       DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url
       RETURNING *`,
      ['Dev Admin User', 'dev-admin@peoplespriorities.org', 'https://avatar.iran.liara.run/public/boy']
    );

    const loggedInUser = dbResult.rows[0];
    
    // Return visual verification dashboard
    sendSuccessResponse(res, loggedInUser, 'Developer Mock Bypass');
  } catch (error) {
    console.error('Mock Login Database Error:', error.message);
    res.status(500).send(`
      <div style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Mock Login Database Error</h2>
        <p>Failed to query or insert record into Neon database.</p>
        <p><strong>Error Message:</strong> <code>${error.message}</code></p>
        <br/>
        <a href="/api/auth/login" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Return to Login</a>
      </div>
    `);
  }
};

// Helper helper function to send standard aesthetic response page
function sendSuccessResponse(res, user, source) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login Success</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #0b0f19;
          color: #f3f4f6;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 40px;
          border-radius: 20px;
          width: 90%;
          max-width: 480px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #6366f1;
          margin-bottom: 20px;
        }
        h2 { color: #10b981; margin-bottom: 5px; }
        .method-tag {
          display: inline-block;
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .user-info {
          text-align: left;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 16px;
          font-family: monospace;
          font-size: 13px;
          word-break: break-all;
          margin-bottom: 24px;
        }
        .back-btn {
          display: block;
          padding: 12px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .back-btn:hover { background: #4f46e5; }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="avatar" src="${user.avatar_url || 'https://avatar.iran.liara.run/public'}" alt="Avatar">
        <h2>Authentication Success!</h2>
        <span class="method-tag">Method: ${source}</span>
        
        <div class="user-info">
          <strong>Database Record Info:</strong><br/>
          ----------------------------<br/>
          ID: ${user.id}<br/>
          Name: ${user.full_name}<br/>
          Email: ${user.email}<br/>
          Created At: ${user.created_at}
        </div>
        
        <a href="/api/auth/login" class="back-btn">Return to Login Portal</a>
      </div>
    </body>
    </html>
  `);
}
