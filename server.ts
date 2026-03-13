import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./src/db"; // Note: using .js for ESM compatibility in some environments, but tsx handles it
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "lyricshub-secret-key-123";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Admin access required" });
    next();
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(name, email, hashedPassword, role || 'artist');
      
      if (role === 'artist' || !role) {
        db.prepare("INSERT INTO artists (user_id, name) VALUES (?, ?)").run(result.lastInsertRowid, name);
      }

      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user: any = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  // Public Songs
  app.get("/api/songs", (req, res) => {
    const { search, limit = 20, status = 'approved' } = req.query;
    let query = `
      SELECT s.*, a.name as artist_name 
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id 
      WHERE s.status = ?
    `;
    const params: any[] = [status];

    if (search) {
      query += ` AND (s.title LIKE ? OR a.name LIKE ? OR s.lyrics LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const songs = db.prepare(query).all(...params);
    res.json(songs);
  });

  app.get("/api/songs/trending", (req, res) => {
    const songs = db.prepare(`
      SELECT s.*, a.name as artist_name 
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id 
      WHERE s.status = 'approved'
      ORDER BY s.views DESC LIMIT 10
    `).all();
    res.json(songs);
  });

  app.get("/api/songs/:id", (req, res) => {
    const song: any = db.prepare(`
      SELECT s.*, a.name as artist_name, a.bio as artist_bio, a.profile_image as artist_image
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id 
      WHERE s.id = ?
    `).get(req.params.id);
    
    if (!song) return res.status(404).json({ error: "Song not found" });
    
    // Increment views
    db.prepare("UPDATE songs SET views = views + 1 WHERE id = ?").run(req.params.id);
    
    res.json(song);
  });

  // Public Artists
  app.get("/api/artists", (req, res) => {
    const artists = db.prepare("SELECT * FROM artists LIMIT 20").all();
    res.json(artists);
  });

  app.get("/api/artists/:id", (req, res) => {
    const artist: any = db.prepare("SELECT * FROM artists WHERE id = ?").get(req.params.id);
    if (!artist) return res.status(404).json({ error: "Artist not found" });
    
    const songs = db.prepare("SELECT * FROM songs WHERE artist_id = ? AND status = 'approved'").all(req.params.id);
    res.json({ ...artist, songs });
  });

  // Artist Dashboard
  app.get("/api/my-songs", authenticateToken, (req: any, res) => {
    const artist: any = db.prepare("SELECT id FROM artists WHERE user_id = ?").get(req.user.id);
    if (!artist) return res.status(403).json({ error: "Not an artist profile" });
    
    const songs = db.prepare("SELECT * FROM songs WHERE artist_id = ?").all(artist.id);
    res.json(songs);
  });

  app.post("/api/songs", authenticateToken, (req: any, res) => {
    const artist: any = db.prepare("SELECT id FROM artists WHERE user_id = ?").get(req.user.id);
    if (!artist && req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const { title, lyrics, album, youtube_link, cover_image, genre, release_year, artist_id } = req.body;
    const finalArtistId = req.user.role === 'admin' ? artist_id : artist.id;

    try {
      const result = db.prepare(`
        INSERT INTO songs (title, artist_id, lyrics, album, youtube_link, cover_image, genre, release_year, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, finalArtistId, lyrics, album, youtube_link, cover_image, genre, release_year, req.user.role === 'admin' ? 'approved' : 'pending');
      
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/songs/:id", authenticateToken, (req: any, res) => {
    const song: any = db.prepare("SELECT * FROM songs WHERE id = ?").get(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const artist: any = db.prepare("SELECT id FROM artists WHERE user_id = ?").get(req.user.id);
    if (req.user.role !== 'admin' && song.artist_id !== artist?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, lyrics, album, youtube_link, cover_image, genre, release_year, status } = req.body;
    const finalStatus = req.user.role === 'admin' ? (status || song.status) : 'pending';

    db.prepare(`
      UPDATE songs 
      SET title = ?, lyrics = ?, album = ?, youtube_link = ?, cover_image = ?, genre = ?, release_year = ?, status = ?
      WHERE id = ?
    `).run(title, lyrics, album, youtube_link, cover_image, genre, release_year, finalStatus, req.params.id);

    res.json({ message: "Song updated" });
  });

  app.delete("/api/songs/:id", authenticateToken, (req: any, res) => {
    const song: any = db.prepare("SELECT * FROM songs WHERE id = ?").get(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const artist: any = db.prepare("SELECT id FROM artists WHERE user_id = ?").get(req.user.id);
    if (req.user.role !== 'admin' && song.artist_id !== artist?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    db.prepare("DELETE FROM songs WHERE id = ?").run(req.params.id);
    res.json({ message: "Song deleted" });
  });

  // Admin: Manage Artists
  app.get("/api/admin/artists", authenticateToken, isAdmin, (req, res) => {
    const artists = db.prepare("SELECT * FROM artists").all();
    res.json(artists);
  });

  app.post("/api/admin/artists", authenticateToken, isAdmin, (req, res) => {
    const { name, bio, profile_image, social_links } = req.body;
    const result = db.prepare("INSERT INTO artists (name, bio, profile_image, social_links) VALUES (?, ?, ?, ?)").run(name, bio, profile_image, JSON.stringify(social_links));
    res.status(201).json({ id: result.lastInsertRowid });
  });

  app.put("/api/admin/artists/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, bio, profile_image, social_links } = req.body;
    db.prepare("UPDATE artists SET name = ?, bio = ?, profile_image = ?, social_links = ? WHERE id = ?").run(name, bio, profile_image, JSON.stringify(social_links), req.params.id);
    res.json({ message: "Artist updated" });
  });

  app.delete("/api/admin/artists/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare("DELETE FROM artists WHERE id = ?").run(req.params.id);
    res.json({ message: "Artist deleted" });
  });

  // Admin: Manage Users
  app.get("/api/admin/users", authenticateToken, isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, name, email, role, created_at FROM users").all();
    res.json(users);
  });

  // Admin: Stats
  app.get("/api/admin/stats", authenticateToken, isAdmin, (req, res) => {
    const totalSongs = db.prepare("SELECT COUNT(*) as count FROM songs").get() as any;
    const pendingSongs = db.prepare("SELECT COUNT(*) as count FROM songs WHERE status = 'pending'").get() as any;
    const totalArtists = db.prepare("SELECT COUNT(*) as count FROM artists").get() as any;
    const totalViews = db.prepare("SELECT SUM(views) as count FROM songs").get() as any;
    
    res.json({
      totalSongs: totalSongs.count,
      pendingSongs: pendingSongs.count,
      totalArtists: totalArtists.count,
      totalViews: totalViews.count || 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
