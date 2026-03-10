import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("hiclue.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE,
    fullname TEXT,
    email TEXT UNIQUE,
    password TEXT,
    bio TEXT,
    avatar TEXT,
    location TEXT,
    role TEXT,
    provider TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT,
    sender_id TEXT,
    text TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // WebSocket logic
  const clients = new Map<string, Set<WebSocket>>();
  const onlineUsers = new Map<string, WebSocket>();

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const roomId = url.searchParams.get("roomId") || "global";
    const userId = url.searchParams.get("userId");

    if (userId) {
      onlineUsers.set(userId, ws);
      // Broadcast online status
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'status', userId, status: 'online' }));
        }
      });
    }

    if (!clients.has(roomId)) {
      clients.set(roomId, new Set());
    }
    clients.get(roomId)!.add(ws);

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'chat') {
        // Save to DB
        db.prepare("INSERT INTO messages (room_id, sender_id, text) VALUES (?, ?, ?)").run(
          roomId,
          message.senderId,
          message.text
        );

        // Broadcast to room
        const payload = JSON.stringify({
          type: 'chat',
          ...message,
          timestamp: new Date().toISOString()
        });

        clients.get(roomId)?.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    });

    ws.on("close", () => {
      if (userId) {
        onlineUsers.delete(userId);
        // Broadcast offline status
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'status', userId, status: 'offline' }));
          }
        });
      }
      clients.get(roomId)?.delete(ws);
      if (clients.get(roomId)?.size === 0) {
        clients.delete(roomId);
      }
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "HIClue Backend is running" });
  });

  app.get("/api/online-users", (req, res) => {
    res.json(Array.from(onlineUsers.keys()));
  });

  // OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/google/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      // Mock URL for demo if no key provided
      return res.json({ url: `${process.env.APP_URL}/auth/google/callback?code=mock_code&mock=true` });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get("/api/auth/apple/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/apple/callback`;
    const clientId = process.env.APPLE_CLIENT_ID;

    if (!clientId) {
      // Mock URL for demo if no key provided
      return res.json({ url: `${process.env.APP_URL}/auth/apple/callback?code=mock_code&mock=true` });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "name email",
      response_mode: "form_post",
    });
    res.json({ url: `https://appleid.apple.com/auth/authorize?${params}` });
  });

  app.get("/api/auth/github/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/github/callback`;
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
      return res.json({ url: `${process.env.APP_URL}/auth/github/callback?code=mock_code&mock=true` });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user:email",
    });
    res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
  });

  app.get("/api/auth/facebook/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/facebook/callback`;
    const clientId = process.env.FACEBOOK_CLIENT_ID;

    if (!clientId) {
      return res.json({ url: `${process.env.APP_URL}/auth/facebook/callback?code=mock_code&mock=true` });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "email,public_profile",
    });
    res.json({ url: `https://www.facebook.com/v12.0/dialog/oauth?${params}` });
  });

  const oauthCallbackHtml = `
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/dashboard';
          }
        </script>
        <p>Authentication successful. This window should close automatically.</p>
      </body>
    </html>
  `;

  const handleOAuthUser = (provider: string, profile: any) => {
    const userId = `${provider}_${profile.id || profile.sub || Math.random().toString(36).substring(2, 7)}`;
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(profile.email) as any;
    
    if (existing) {
      db.prepare("UPDATE users SET provider = ?, avatar = ? WHERE email = ?").run(provider, profile.avatar || profile.picture, profile.email);
      return existing.userId || existing.id.toString();
    } else {
      db.prepare("INSERT INTO users (userId, fullname, email, provider, avatar, role, location) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        userId,
        profile.name || profile.fullname || profile.email.split('@')[0],
        profile.email,
        provider,
        profile.avatar || profile.picture,
        "Premium Member",
        "New York, NY"
      );
      return userId;
    }
  };

  app.get("/auth/google/callback", async (req, res) => {
    const { code, mock } = req.query;
    let userId = "mock_user";

    if (mock === "true") {
      userId = handleOAuthUser("google", { email: "demo@google.com", name: "Demo User", id: "demo_google" });
    } else if (code) {
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: code as string,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
            grant_type: "authorization_code",
          }),
        });
        const tokens = await response.json();
        userId = handleOAuthUser("google", { email: "user@google.com", name: "Google User", id: tokens.id_token || "google_id" });
      } catch (err) {
        console.error("Google token exchange failed:", err);
      }
    }
    
    res.cookie("session_id", userId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.send(oauthCallbackHtml);
  });

  app.get("/auth/github/callback", async (req, res) => {
    const { code, mock } = req.query;
    let userId = "mock_user";

    if (mock === "true") {
      userId = handleOAuthUser("github", { email: "demo@github.com", name: "GitHub Demo", id: "demo_github" });
    } else if (code) {
      try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: `${process.env.APP_URL}/auth/github/callback`,
          }),
        });
        const tokens = await response.json();
        userId = handleOAuthUser("github", { email: "user@github.com", name: "GitHub User", id: tokens.access_token || "github_id" });
      } catch (err) {
        console.error("GitHub token exchange failed:", err);
      }
    }
    
    res.cookie("session_id", userId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.send(oauthCallbackHtml);
  });

  app.get("/auth/facebook/callback", async (req, res) => {
    const { code, mock } = req.query;
    let userId = "mock_user";

    if (mock === "true") {
      userId = handleOAuthUser("facebook", { email: "demo@facebook.com", name: "Facebook Demo", id: "demo_fb" });
    } else if (code) {
      try {
        const params = new URLSearchParams({
          client_id: process.env.FACEBOOK_CLIENT_ID!,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
          redirect_uri: `${process.env.APP_URL}/auth/facebook/callback`,
          code: code as string,
        });
        const response = await fetch(`https://graph.facebook.com/v12.0/oauth/access_token?${params}`, {
          method: "GET",
          headers: { "Accept": "application/json" },
        });
        const tokens = await response.json();
        userId = handleOAuthUser("facebook", { email: "user@facebook.com", name: "Facebook User", id: tokens.access_token || "fb_id" });
      } catch (err) {
        console.error("Facebook token exchange failed:", err);
      }
    }
    
    res.cookie("session_id", userId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.send(oauthCallbackHtml);
  });

  app.all(["/auth/apple/callback", "/auth/apple/callback/"], (req, res) => {
    const { code, mock } = req.query;
    let userId = handleOAuthUser("apple", { email: "demo@apple.com", name: "Apple User", id: "demo_apple" });
    
    res.cookie("session_id", userId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.send(oauthCallbackHtml);
  });

  app.get("/api/stats", (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    res.json({
      matchesMade: "2.4M+",
      compatibilityRate: "98.5%",
      activeUsers: userCount.count + 150000
    });
  });

  app.post("/api/signup", (req, res) => {
    const { fullname, email, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)").run(fullname, email, password);
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.get("/api/messages/:roomId", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC").all(req.params.roomId);
    res.json(messages);
  });

  app.get("/api/profile/:email", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.params.email);
    res.json(user || { fullname: "Robert Dagadzi", role: "Premium Member", location: "New York, NY", bio: "Passionate about building meaningful connections." });
  });

  app.post("/api/profile/update", (req, res) => {
    const { email, fullname, bio, location, role } = req.body;
    try {
      db.prepare("UPDATE users SET fullname = ?, bio = ?, location = ?, role = ? WHERE email = ?").run(
        fullname, bio, location, role, email
      );
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
