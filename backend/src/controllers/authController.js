import path from 'path';
import fs from 'fs';
import pool from '../db.js';

// Get views folder path dynamically
const __dirname = path.resolve();
const LOGIN_PAGE_PATH = path.join(__dirname, 'src', 'views', 'login.html');

// In-memory session store (token -> user details)
export const sessions = {};

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

    // Generate session token
    const token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Assign role. Email domains ending with @assembly.gov are MP/Admins. Otherwise Citizen.
    let role = 'CITIZEN';
    if (userInfo.email.toLowerCase().includes('admin')) {
      role = 'ADMINISTRATOR';
    } else if (userInfo.email.toLowerCase().includes('mp') || userInfo.email.toLowerCase().endsWith('@assembly.gov')) {
      role = 'MP';
    }

    const userSession = {
      id: loggedInUser.id,
      name: loggedInUser.full_name,
      email: loggedInUser.email,
      role: role,
      avatarUrl: loggedInUser.avatar_url
    };
    
    sessions[token] = userSession;

    // Redirect back to frontend with session token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/?token=${token}`);

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
    
    // Generate session token
    const token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    sessions[token] = {
      id: loggedInUser.id,
      name: loggedInUser.full_name,
      email: loggedInUser.email,
      role: 'MP',
      avatarUrl: loggedInUser.avatar_url
    };

    // Redirect to frontend with token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/?token=${token}`);
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

/**
 * Standard POST /api/auth/login endpoint (supporting form submit + seed bypass inputs)
 */
export const login = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Look up user in Neon database
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    let dbUser = result.rows[0];

    // Auto-seed key bypass users if they do not exist yet in database
    if (!dbUser && (email === 'mp@assembly.gov' || email === 'admin@assembly.gov' || email === 'citizen@assembly.gov')) {
      let name = 'Councilor J. Doe';
      let avatar = 'https://avatar.iran.liara.run/public/boy';
      if (email === 'admin@assembly.gov') {
        name = 'Administrator Smith';
        avatar = 'https://avatar.iran.liara.run/public/girl';
      } else if (email === 'citizen@assembly.gov') {
        name = 'Jane Smith (Citizen)';
        avatar = 'https://avatar.iran.liara.run/public/girl';
      }
      
      const insertResult = await pool.query(
        `INSERT INTO users (full_name, email, avatar_url)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, email.toLowerCase(), avatar]
      );
      dbUser = insertResult.rows[0];
    }

    if (!dbUser) {
      return res.status(401).json({ error: 'Invalid credentials or user does not exist.' });
    }

    // Role assignment based on email keywords
    let role = 'CITIZEN';
    if (email.toLowerCase().includes('admin')) {
      role = 'ADMINISTRATOR';
    } else if (email.toLowerCase().includes('mp')) {
      role = 'MP';
    }

    const token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    const userSession = {
      id: dbUser.id,
      name: dbUser.full_name,
      email: dbUser.email,
      role: role,
      avatarUrl: dbUser.avatar_url
    };

    sessions[token] = userSession;

    res.json({ user: userSession, token });
  } catch (error) {
    console.error('Login database error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * GET /api/auth/me - Retrieves the active session user
 */
export const getMe = (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userSession = sessions[token];
    if (userSession) {
      return res.json({ user: userSession });
    }
  }
  res.status(401).json({ error: 'Unauthorized access' });
};

/**
 * POST /api/auth/logout - Terminates the active session
 */
export const logout = (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    delete sessions[token];
  }
  res.json({ success: true });
};

/**
 * POST /api/auth/profile/update - Updates the user profile in Neon DB
 */
export const updateProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.substring(7);
  const userSession = sessions[token];
  if (!userSession) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const { name, email, avatarUrl } = req.body;

  try {
    const dbResult = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           email = COALESCE($2, email), 
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING *`,
      [name, email ? email.toLowerCase() : null, avatarUrl, userSession.id]
    );

    const updatedUser = dbResult.rows[0];

    // Synchronize current session details
    userSession.name = updatedUser.full_name;
    userSession.email = updatedUser.email;
    userSession.avatarUrl = updatedUser.avatar_url;

    res.json({ user: userSession });
  } catch (error) {
    console.error('Update profile database error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
