import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Ensure directories exist
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, "database.json");

// Owner credentials from environment or defaults
const OWNER_USERNAME = process.env.OWNER_USERNAME || "Gagan3806";
const RAW_OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Gagan3806";

interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: "Owner" | "Manager" | "User";
  createdAt: string;
}

interface Book {
  id: string;
  userId: string;
  title: string;
  author?: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  fileType: "book" | "document" | "notes" | "ebook";
  category: string;
  tags: string[];
  pageCount: number;
  currentPage: number;
  readingProgress: number; // 0 - 100
  lastRead: string;
  uploadDate: string;
  thumbnail: string; // Front cover
  frontCover?: string;
  backCover?: string;
  bookmarks: number[];
  isFavorite: boolean;
}

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoginEvent {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  status: "Success" | "Active" | "Terminated" | "Expired" | "Failed";
  logoutTime?: string;
  isCurrent?: boolean;
}

interface ActiveSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo: string;
  ip: string;
}

interface DatabaseSchema {
  users: User[];
  books: Book[];
  notes: Note[];
  activeSession: ActiveSession | null;
  loginHistory: LoginEvent[];
}

// Initial Default Data
const defaultPasswordHash = bcrypt.hashSync(RAW_OWNER_PASSWORD, 10);

const defaultData: DatabaseSchema = {
  users: [
    {
      id: "owner-1",
      name: "Master Administrator",
      username: OWNER_USERNAME,
      passwordHash: defaultPasswordHash,
      role: "Owner",
      createdAt: new Date().toISOString()
    },
    {
      id: "user-student-1",
      name: "Ayushman Student Reader",
      username: "student",
      passwordHash: bcrypt.hashSync("student123", 10),
      role: "User",
      createdAt: new Date().toISOString()
    }
  ],
  books: [],
  notes: [],
  activeSession: null,
  loginHistory: []
};

function readDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.loginHistory) parsed.loginHistory = [];
    // Ensure owner credentials match current environment/defaults
    if (parsed.users && parsed.users[0]) {
      parsed.users[0].username = OWNER_USERNAME;
      parsed.users[0].passwordHash = bcrypt.hashSync(RAW_OWNER_PASSWORD, 10);
    }
    // Ensure student user exists
    if (parsed.users && !parsed.users.some((u: any) => u.username === "student")) {
      parsed.users.push({
        id: "user-student-1",
        name: "Ayushman Student Reader",
        username: "student",
        passwordHash: bcrypt.hashSync("student123", 10),
        role: "User",
        createdAt: new Date().toISOString()
      });
    }
    // Filter out old pre-populated sample books and notes if any exist
    if (parsed.books) {
      parsed.books = parsed.books.filter((b: any) => b.id !== "book-1" && b.id !== "book-2");
    }
    if (parsed.notes) {
      parsed.notes = parsed.notes.filter((n: any) => n.id !== "note-1");
    }
    // Force activeSession to null on load so login is strictly required
    parsed.activeSession = null;
    return parsed;
  } catch (err) {
    return defaultData;
  }
}

function writeDB(data: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Multer setup for PDF and Cover uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_"));
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper to parse User-Agent for device info
function parseUserAgent(ua: string = "") {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Desktop PC";

  if (ua.includes("Firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari")) browser = "Apple Safari";
  else if (ua.includes("Edge")) browser = "Microsoft Edge";

  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; device = "Mobile Device"; }
  else if (ua.includes("Android")) { os = "Android"; device = "Mobile Device"; }

  return { browser, os, device };
}

// ==================== AUTH ROUTES (PRIVATE SINGLE OWNER) ====================

app.post("/api/auth/login", (req, res) => {
  const { username, password, force } = req.body;
  const db = readDB();

  const userObj = db.users.find((u) => u.username === username);
  if (!userObj || !bcrypt.compareSync(password, userObj.passwordHash)) {
    // Record failed login attempt
    const ua = req.headers["user-agent"] || "";
    const { browser, os, device } = parseUserAgent(ua);
    db.loginHistory.unshift({
      id: "log-" + uuidv4(),
      timestamp: new Date().toISOString(),
      device,
      browser,
      os,
      ip: req.ip || req.socket.remoteAddress || "127.0.0.1",
      status: "Failed"
    });
    writeDB(db);
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Check single active session
  if (db.activeSession && !force) {
    return res.status(409).json({
      error: "Session Conflict",
      message: `An active session already exists on another device (${db.activeSession.deviceInfo || "Unknown Device"}).`,
      existingSession: db.activeSession
    });
  }

  // Create new session token
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString(); // 20 minutes
  const ua = req.headers["user-agent"] || "";
  const { browser, os, device } = parseUserAgent(ua);
  const deviceInfo = `${device} (${browser} on ${os})`;
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";

  // Mark previous session in history as terminated if forced
  if (db.activeSession && force) {
    const prevLog = db.loginHistory.find(l => l.isCurrent);
    if (prevLog) {
      prevLog.status = "Terminated";
      prevLog.logoutTime = new Date().toISOString();
      prevLog.isCurrent = false;
    }
  }

  db.activeSession = {
    token,
    userId: userObj.id,
    createdAt: new Date().toISOString(),
    expiresAt,
    deviceInfo,
    ip
  };

  db.loginHistory.unshift({
    id: "log-" + uuidv4(),
    timestamp: new Date().toISOString(),
    device,
    browser,
    os,
    ip,
    status: "Active",
    isCurrent: true
  });

  writeDB(db);

  // Set HTTP-only cookie
  res.cookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 20 * 60 * 1000
  });

  const { passwordHash: _, ...userProfile } = userObj;
  res.json({ user: userProfile, token });
});

app.post("/api/auth/register", (req, res) => {
  const { name, username, password } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const db = readDB();
  if (db.users.some(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  const newUser = {
    id: "user-" + uuidv4(),
    name,
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "User" as const,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDB(db);
  const { passwordHash: _, ...userProfile } = newUser;
  res.json({ user: userProfile });
});

app.post("/api/auth/logout", (req, res) => {
  const db = readDB();
  if (db.activeSession) {
    const currentLog = db.loginHistory.find(l => l.isCurrent);
    if (currentLog) {
      currentLog.status = "Terminated";
      currentLog.logoutTime = new Date().toISOString();
      currentLog.isCurrent = false;
    }
    db.activeSession = null;
    writeDB(db);
  }
  res.clearCookie("session_token");
  res.json({ success: true });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "") || req.cookies?.session_token;
  const db = readDB();

  if (!db.activeSession) {
    return res.status(401).json({ error: "Not logged in" });
  }

  // Check if session expired after 20 minutes
  if (new Date() > new Date(db.activeSession.expiresAt)) {
    const currentLog = db.loginHistory.find(l => l.isCurrent);
    if (currentLog) {
      currentLog.status = "Expired";
      currentLog.logoutTime = new Date().toISOString();
      currentLog.isCurrent = false;
    }
    db.activeSession = null;
    writeDB(db);
    res.clearCookie("session_token");
    return res.status(401).json({ error: "Session expired after 20 minutes" });
  }

  const user = db.users.find(u => u.id === db.activeSession?.userId);
  if (!user) {
    db.activeSession = null;
    writeDB(db);
    res.clearCookie("session_token");
    return res.status(401).json({ error: "User not found" });
  }

  const { passwordHash: _, ...userProfile } = user;
  res.json({
    user: userProfile,
    session: db.activeSession
  });
});

app.get("/api/security/activity", (req, res) => {
  const db = readDB();
  res.json(db.loginHistory);
});

// Middleware to restrict write operations to Manager only
function requireManager(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "") || req.cookies?.session_token;
  const db = readDB();

  if (!db.activeSession) {
    return res.status(401).json({ error: "Not logged in" });
  }

  if (new Date() > new Date(db.activeSession.expiresAt)) {
    const currentLog = db.loginHistory.find(l => l.isCurrent);
    if (currentLog) {
      currentLog.status = "Expired";
      currentLog.logoutTime = new Date().toISOString();
      currentLog.isCurrent = false;
    }
    db.activeSession = null;
    writeDB(db);
    res.clearCookie("session_token");
    return res.status(401).json({ error: "Session expired after 20 minutes" });
  }

  const user = db.users.find(u => u.id === db.activeSession?.userId);
  if (!user || user.role !== "Owner") {
    return res.status(403).json({ error: "Access denied. Only the Owner/Manager can perform this action." });
  }
  next();
}

// ==================== BOOKS ROUTES ====================

app.get("/api/books", (req, res) => {
  const db = readDB();
  res.json(db.books);
});

app.post("/api/books/upload", requireManager, upload.fields([
  { name: "file", maxCount: 1 },
  { name: "frontCover", maxCount: 1 },
  { name: "backCover", maxCount: 1 }
]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const pdfFile = files?.file?.[0];
    const frontCoverFile = files?.frontCover?.[0];
    const backCoverFile = files?.backCover?.[0];

    const { title, author = "", category = "General", fileType = "book", tags = "[]", pageCount = "50" } = req.body;

    if (!pdfFile) {
      return res.status(400).json({ error: "Original PDF file is required" });
    }

    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    const bookId = "book-" + uuidv4();
    const owner = dbUsersDefault(); // Helper

    const frontCoverUrl = frontCoverFile ? `/uploads/${frontCoverFile.filename}` : "";
    const backCoverUrl = backCoverFile ? `/uploads/${backCoverFile.filename}` : "";

    const newBook: Book = {
      id: bookId,
      userId: "owner-1",
      title: title || pdfFile.originalname.replace(/\.[^/.]+$/, ""),
      author: author || "Unknown Author",
      originalFilename: pdfFile.originalname,
      filePath: pdfFile.filename,
      fileSize: pdfFile.size,
      fileType: fileType as any,
      category: category || "General",
      tags: parsedTags,
      pageCount: parseInt(pageCount, 10) || 50,
      currentPage: 1,
      readingProgress: 0,
      lastRead: new Date().toISOString(),
      uploadDate: new Date().toISOString(),
      thumbnail: frontCoverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      frontCover: frontCoverUrl,
      backCover: backCoverUrl,
      bookmarks: [],
      isFavorite: false
    };

    const db = readDB();
    db.books.unshift(newBook);
    writeDB(db);

    res.json(newBook);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

function dbUsersDefault() {
  return "owner-1";
}

app.put("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const bookIndex = db.books.findIndex((b) => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const updatedBook = {
    ...db.books[bookIndex],
    ...req.body,
    lastRead: new Date().toISOString()
  };

  if (updatedBook.currentPage !== undefined && updatedBook.pageCount) {
    updatedBook.readingProgress = Math.min(
      100,
      Math.max(0, Math.round((updatedBook.currentPage / updatedBook.pageCount) * 100))
    );
  }

  db.books[bookIndex] = updatedBook;
  writeDB(db);
  res.json(updatedBook);
});

app.put("/api/books/:id/favorite", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const book = db.books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  book.isFavorite = !book.isFavorite;
  writeDB(db);
  res.json(book);
});

app.put("/api/books/:id/progress", (req, res) => {
  const { id } = req.params;
  const { currentPage, bookmarks } = req.body;
  const db = readDB();
  const book = db.books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  book.currentPage = currentPage || book.currentPage;
  if (bookmarks) book.bookmarks = bookmarks;
  book.readingProgress = Math.min(
    100,
    Math.max(0, Math.round((book.currentPage / book.pageCount) * 100))
  );
  book.lastRead = new Date().toISOString();
  writeDB(db);
  res.json(book);
});

app.delete("/api/books/:id", requireManager, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const book = db.books.find((b) => b.id === id);
  if (book && book.filePath) {
    const filePath = path.join(UPLOADS_DIR, book.filePath);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
  db.books = db.books.filter((b) => b.id !== id);
  writeDB(db);
  res.json({ success: true });
});

app.get("/api/books/:id/file", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const book = db.books.find((b) => b.id === id);
  if (!book || !book.filePath) {
    return res.status(404).json({ error: "PDF file not found" });
  }
  const filePath = path.join(UPLOADS_DIR, book.filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File missing from disk" });
  }
  res.sendFile(filePath);
});

// ==================== NOTES ROUTES ====================

app.get("/api/notes", (req, res) => {
  const db = readDB();
  res.json(db.notes);
});

app.post("/api/notes", requireManager, (req, res) => {
  const { title, content, category = "General", tags = [], isPinned = false, isFavorite = false } = req.body;
  const db = readDB();
  const newNote: Note = {
    id: "note-" + uuidv4(),
    userId: "owner-1",
    title: title || "Untitled Note",
    content: content || "",
    category: category || "General",
    tags: Array.isArray(tags) ? tags : [],
    isPinned: !!isPinned,
    isFavorite: !!isFavorite,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.notes.unshift(newNote);
  writeDB(db);
  res.json(newNote);
});

app.put("/api/notes/:id", requireManager, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.notes.findIndex((n) => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Note not found" });

  const updatedNote = {
    ...db.notes[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.notes[index] = updatedNote;
  writeDB(db);
  res.json(updatedNote);
});

app.delete("/api/notes/:id", requireManager, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.notes = db.notes.filter((n) => n.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// ==================== SITEMAP FOR GOOGLE SEARCH ====================

app.get("/sitemap.xml", (req, res) => {
  const db = readDB();
  const baseUrl = "https://ais-dev-6zlocams7m34plqdwxpomh-435039530571.asia-southeast1.run.app";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Home / Dashboard
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Books
  db.books.forEach(book => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?book=${book.id}</loc>\n`;
    xml += `    <lastmod>${book.uploadDate || new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // Notes
  db.notes.forEach(note => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?note=${note.id}</loc>\n`;
    xml += `    <lastmod>${note.updatedAt || note.createdAt || new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});

// ==================== GLOBAL SEARCH ====================

app.get("/api/search", async (req, res) => {
  const q = ((req.query.q as string) || "").trim();
  const lowerQ = q.toLowerCase();
  const db = readDB();

  const matchingBooks = db.books.filter(
    (b) =>
      b.title.toLowerCase().includes(lowerQ) ||
      b.category.toLowerCase().includes(lowerQ) ||
      b.tags.some((t) => t.toLowerCase().includes(lowerQ))
  );

  const matchingNotes = db.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(lowerQ) ||
      n.content.toLowerCase().includes(lowerQ) ||
      n.category.toLowerCase().includes(lowerQ) ||
      n.tags.some((t) => t.toLowerCase().includes(lowerQ))
  );

  let googleBooks: any[] = [];
  if (q.length > 0) {
    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY || process.env.GEMINI_API_KEY || "";
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}${apiKey ? `&key=${apiKey}` : ""}&maxResults=12`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.items) {
        googleBooks = data.items.map((item: any) => {
          const info = item.volumeInfo || {};
          return {
            id: `google-${item.id}`,
            title: info.title || "Untitled Book",
            author: info.authors ? info.authors.join(", ") : "Unknown Author",
            category: info.categories ? info.categories[0] : "General",
            fileUrl: info.previewLink || info.infoLink || "",
            fileType: "ebook",
            pageCount: info.pageCount || 100,
            frontCoverUrl: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
            description: info.description || "",
            tags: info.categories || ["Google Books"],
            isGoogleBook: true
          };
        });
      }
    } catch (err) {
      console.error("Error fetching from Google Books API:", err);
    }
  }

  res.json({ books: matchingBooks, notes: matchingNotes, googleBooks });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AuraLibrary Manager server running on http://localhost:${PORT}`);
  });
}

startServer();
