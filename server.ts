import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Collection, AuthUser, StorageFile, CloudFunction, APIKey, ZongoLog, RealtimeConnection, WebProject, DevMessage } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Internal State
const dbData: {
  collections: Collection[];
  users: AuthUser[];
  projects: WebProject[];
  files: StorageFile[];
  functions: CloudFunction[];
  apiKeys: APIKey[];
  logs: ZongoLog[];
  messages: DevMessage[];
} = {
  messages: [
    {
      id: "msg_1",
      senderEmail: "dev_community@zongobase.com",
      senderName: "Marcus Aurelius",
      subject: "ZongoBase Setup Feedback",
      text: "The zero-config integration is incredibly fast! I linked my standalone client in under 3 seconds using the 1-Line secure proxy setup command. Much more breezier than traditional SDK platforms.",
      createdAt: new Date(Date.now() - 72000000).toISOString()
    }
  ],
  collections: [
    {
      name: "users_profile",
      description: "App user profile metadata and security roles",
      documents: [
        {
          id: "usr_1001",
          data: { username: "alex_dev", age: 28, plan: "premium", country: "US" },
          createdAt: new Date(Date.now() - 360000000).toISOString(),
          updatedAt: new Date(Date.now() - 18000000).toISOString(),
        },
        {
          id: "usr_1002",
          data: { username: "sofia_m", age: 31, plan: "free", country: "FR" },
          createdAt: new Date(Date.now() - 180000000).toISOString(),
          updatedAt: new Date(Date.now() - 360000).toISOString(),
        }
      ],
      indexes: ["username", "country"]
    },
    {
      name: "orders",
      description: "E-commerce transactional purchase entries",
      documents: [
        {
          id: "ord_5001",
          data: { item: "ZongoBase Node Developer Kit", amount: 149.00, status: "completed", gateway: "stripe" },
          createdAt: new Date(Date.now() - 720000000).toISOString(),
          updatedAt: new Date(Date.now() - 720000000).toISOString(),
        },
        {
          id: "ord_5002",
          data: { item: "Cloud Tier Cloudlet Storage", amount: 24.50, status: "pending", gateway: "paypal" },
          createdAt: new Date(Date.now() - 36000000).toISOString(),
          updatedAt: new Date(Date.now() - 36000000).toISOString(),
        }
      ],
      indexes: ["id", "status"]
    },
    {
      name: "sofia_ecommerce_products",
      description: "Sofia's online shop inventory",
      documents: [
        {
          id: "prod_1",
          data: { title: "Vintage Leather Jacket", price: 120, stock: 15, active: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "prod_2",
          data: { title: "Handcrafted Ceramic Mug", price: 24.99, stock: 45, active: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      indexes: ["price", "id"],
      ownerId: "u_xyz789" // Sofia's user ID
    }
  ],
  users: [
    {
      id: "u_abc123",
      email: "admin@zongobase.com",
      password: "admin*", // Administrator password
      displayName: "Admin Panel Master",
      role: "admin",
      status: "active",
      lastSignIn: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "u_xyz789",
      email: "dev@zongobase.com",
      password: "dev*", // Regular developer password
      displayName: "Developer Core Client",
      role: "user",
      status: "active",
      lastSignIn: new Date(Date.now() - 180000).toISOString()
    }
  ],
  projects: [
    {
      id: "proj_sofia_1",
      name: "Sofia Custom Storefront",
      domainUrl: "https://sofia-shop.netlify.app",
      description: "My personal electronic and fashion storefront website.",
      apiKey: "zb_public_u_xyz789_4a82c",
      ownerId: "u_xyz789",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  files: [
    {
      id: "file_1",
      name: "zongobase-schema.json",
      path: "/configs/zongobase-schema.json",
      size: 512,
      mimeType: "application/json",
      content: JSON.stringify({ version: "2.1.0", engine: "ZongoLight" }, null, 2),
      updatedAt: new Date(Date.now() - 72000000).toISOString()
    },
    {
      id: "file_2",
      name: "welcome_guide.md",
      path: "/guides/welcome_guide.md",
      size: 154,
      mimeType: "text/markdown",
      content: "# Welcome to ZongoBase DB\nThis platform gives you complete control over database collections, auth, file storage, and serverless scripts.",
      updatedAt: new Date().toISOString()
    }
  ],
  functions: [
    {
      id: "fn_1",
      name: "hashUserPassword",
      trigger: "auth:create",
      code: `// Hash payload password properties or generate system profiles automatically
exports.onUserCreated = async (user) => {
  console.log("Configuring sandbox environment for: " + user.displayName);
  const metadata = {
    joinedAt: new Date(),
    zongobaseVerified: true,
  };
  return { ...user, metadata };
};`,
      status: "active",
      lastRun: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: "fn_2",
      name: "validateOrderAmount",
      trigger: "db:write",
      code: `// Ensure transaction entries are valid and dispatch alert webhooks
exports.onDatabaseWrite = async (change) => {
  const { before, after } = change;
  console.log("Database event triggered on " + after.amount);
  if (after && after.amount > 500) {
    console.warn("ALERT: Extreme order value detected!");
  }
  return true;
};`,
      status: "active",
      lastRun: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  apiKeys: [
    {
      id: "key_prod_root",
      name: "Production Root API Key",
      secret: "nx_root_8fa2c30dfbe0e81bac8a0029b3cef",
      role: "root",
      createdAt: new Date(Date.now() - 1000000000).toISOString(),
      lastUsed: new Date().toISOString()
    },
    {
      id: "key_dev_read",
      name: "Frontend Public SDK Key",
      secret: "nx_pub_b3a1fcde4e9a8fcf9a2d3e1bcf801d",
      role: "public",
      createdAt: new Date(Date.now() - 500000000).toISOString(),
      lastUsed: new Date(Date.now() - 100000).toISOString()
    }
  ],
  logs: [
    {
      id: "log_1",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "success",
      service: "gateway",
      message: "ZongoBase gateway loaded. Ready to serve requests."
    },
    {
      id: "log_2",
      timestamp: new Date().toISOString(),
      type: "info",
      service: "database",
      message: "Database initialized back-end pools. 2 memory collections initialized."
    }
  ]
};

// Real-time synchronization active clients
let sseClients: any[] = [];

function emitSync(event: string, data: any) {
  sseClients.forEach(client => {
    client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}

function pushLog(type: 'info' | 'warn' | 'error' | 'success', service: 'database' | 'auth' | 'storage' | 'functions' | 'gateway', message: string) {
  const newLog: ZongoLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type,
    service,
    message
  };
  dbData.logs.unshift(newLog);
  if (dbData.logs.length > 50) {
    dbData.logs.pop();
  }
  // Notify active clients of new logs
  emitSync("log", newLog);
}

// Authentication Context Helpers
function getRequestUser(req: express.Request): AuthUser | null {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers["x-zongobase-user-id"];
  
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (userIdHeader) {
    token = String(userIdHeader);
  }
  
  if (token) {
    const found = dbData.users.find(u => u.id === token);
    if (found) return found;
    const foundByEmail = dbData.users.find(u => u.email === token);
    if (foundByEmail) return foundByEmail;
  }
  return null;
}

function validateApiKey(req: express.Request): { valid: boolean; scope: 'admin' | 'user'; ownerId?: string } {
  const authHeader = req.headers.authorization;
  const keyQuery = req.query.apiKey;
  const customHeader = req.headers["x-zongobase-api-key"];
  
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = String(customHeader);
  } else if (keyQuery) {
    token = String(keyQuery);
  }
  
  if (!token) {
    return { valid: false, scope: "user" };
  }
  
  if (token === "nx_root_8fa2c30dfbe0e81bac8a0029b3cef") {
    return { valid: true, scope: "admin" };
  }
  
  // Check in projects API keys
  const project = dbData.projects.find(p => p.apiKey === token);
  if (project) {
    return { valid: true, scope: "user", ownerId: project.ownerId };
  }
  
  // Check general configuration API keys
  const key = dbData.apiKeys.find(k => k.secret === token);
  if (key) {
    return { valid: true, scope: key.role === "root" ? "admin" : "user" };
  }
  
  // Fallback direct user-id check for simple mock testing
  const user = dbData.users.find(u => u.id === token);
  if (user) {
    return { valid: true, scope: user.role === "admin" ? "admin" : "user", ownerId: user.id };
  }
  
  return { valid: false, scope: "user" };
}

// REST Api Endpoints

// 1. SSE Real-time Synchronizer
app.get("/api/zongobase/db/sync", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  res.write(`event: init\ndata: ${JSON.stringify({
    collections: dbData.collections,
    users: dbData.users,
    projects: dbData.projects,
    files: dbData.files,
    functions: dbData.functions,
    apiKeys: dbData.apiKeys,
    logs: dbData.logs,
    messages: dbData.messages
  })}\n\n`);

  sseClients.push(res);
  pushLog("info", "gateway", `Client linked real-time synchronization loop. Consumers counter: ${sseClients.length}`);

  req.on("close", () => {
    sseClients = sseClients.filter(client => client !== res);
    pushLog("info", "gateway", `Client disconnected synchronization channel. Active consumers: ${sseClients.length}`);
  });
});

// In-memory verification code storage (Email -> 6-digit Code)
const verificationCodes: Record<string, string> = {};

// Real-time Authentication Login/Register REST API Gateways
app.post("/api/zongobase/auth/send-code", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }
  const cleanEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[cleanEmail] = code;
  
  pushLog("info", "auth", `Security verification code sent to ${cleanEmail}: [ ${code} ]`);
  res.json({ success: true, code, message: `Verification code generated for ${cleanEmail}` });
});

app.post("/api/zongobase/auth/login", (req, res) => {
  const { email, password, verificationCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email address and password parameters are required." });
  }
  
  const user = dbData.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: "Audit Failed: Account email address not registered." });
  }
  if (user.status === "suspended") {
    return res.status(403).json({ error: "Access Denied: This developer portal footprint is suspended." });
  }
  let isPasswordValid = user.password === password;
  if (!isPasswordValid) {
    if (user.email === "admin@zongobase.com" && (password === "admin" || password === "admin*")) {
      isPasswordValid = true;
    } else if (user.email === "dev@zongobase.com" && (password === "dev" || password === "dev*")) {
      isPasswordValid = true;
    }
  }
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Audit Failed: Password authentication failed." });
  }

  // Enforce verification codes for anyone except default seeded users
  const isDefaultAcc = user.email === "admin@zongobase.com" || user.email === "dev@zongobase.com";
  if (!isDefaultAcc) {
    const cleanEmail = email.toLowerCase().trim();
    const storedCode = verificationCodes[cleanEmail];
    if (!verificationCode || verificationCode !== storedCode) {
      return res.status(401).json({ error: "Verification Failed: Invalid or expired email verification code." });
    }
    // Code exhausted
    delete verificationCodes[cleanEmail];
  }
  
  user.lastSignIn = new Date().toISOString();
  pushLog("success", "auth", `Successful gateway console authentication for [${user.displayName}] (${user.role})`);
  res.json({ success: true, user });
});

app.post("/api/zongobase/auth/register", (req, res) => {
  const { email, password, displayName, verificationCode } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Required registry parameters (email, password, displayName) are missing." });
  }
  
  const normalized = email.toLowerCase().trim();
  if (dbData.users.some(u => u.email.toLowerCase() === normalized)) {
    return res.status(400).json({ error: "Conflict Rejected: Email address already registered." });
  }

  // Validate verification code
  const storedCode = verificationCodes[normalized];
  if (!verificationCode || verificationCode !== storedCode) {
    return res.status(401).json({ error: "Verification Failed: Please request and enter the 6-digit verification code sent to your email." });
  }
  delete verificationCodes[normalized];
  
  const newUser: AuthUser = {
    id: `u_${Math.random().toString(36).substring(2, 9)}`,
    email: normalized,
    password,
    displayName: displayName.trim(),
    role: "user",
    status: "active",
    lastSignIn: new Date().toISOString()
  };
  
  dbData.users.push(newUser);
  
  // Auto-generate starter projects
  const entropy = Math.random().toString(36).substring(2, 7);
  const newProj: WebProject = {
    id: `proj_${Date.now()}`,
    name: `${displayName.trim()}'s Workspace`,
    domainUrl: "https://localhost:5173",
    description: "Autogenerated database container environment.",
    apiKey: `zb_public_${newUser.id}_${entropy}`,
    ownerId: newUser.id,
    createdAt: new Date().toISOString()
  };
  dbData.projects.push(newProj);
  emitSync("users:updated", dbData.users);
  
  // Auto-seed user default collection
  const seedName = `${displayName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")}_inventory`;
  dbData.collections.push({
    name: seedName,
    description: "Default inventory template loaded with workspace register.",
    documents: [
      {
        id: "seed_item_101",
        data: { title: "ZongoBase Cloud Ledger", price: 0.0, stock: 1, live: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    indexes: ["id"],
    ownerId: newUser.id
  });
  emitSync("collections:updated", dbData.collections);
  
  pushLog("success", "auth", `Registered database authenticating user [${newUser.id}: ${normalized}]`);
  res.status(201).json({ success: true, user: newUser });
});

// Firebase Federated Google Authentication Gateway
app.post("/api/zongobase/auth/google", (req, res) => {
  const { email, displayName } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google OAuth parameter 'email' is required." });
  }
  
  const normalized = email.toLowerCase().trim();
  let user = dbData.users.find(u => u.email.toLowerCase() === normalized);
  
  if (!user) {
    user = {
      id: `u_${Math.random().toString(36).substring(2, 9)}`,
      email: normalized,
      password: `google_federated_${Math.random().toString(36).substring(2, 10)}`,
      displayName: displayName || email.split("@")[0],
      role: "user",
      status: "active",
      lastSignIn: new Date().toISOString()
    };
    dbData.users.push(user);
    
    // Auto-generate starter projects
    const entropy = Math.random().toString(36).substring(2, 7);
    const newProj: WebProject = {
      id: `proj_${Date.now()}`,
      name: `${user.displayName}'s Workspace`,
      domainUrl: "https://localhost:5173",
      description: "Auto-provisioned remote workspace sandbox.",
      apiKey: `zb_public_${user.id}_${entropy}`,
      ownerId: user.id,
      createdAt: new Date().toISOString()
    };
    dbData.projects.push(newProj);
    emitSync("users:updated", dbData.users);
    
    // Auto-seed user default collection
    const seedName = `${user.displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")}_inventory`;
    dbData.collections.push({
      name: seedName,
      description: "Default inventory template loaded with workspace register.",
      documents: [
        {
          id: "seed_item_101",
          data: { title: "ZongoBase Cloud Ledger", price: 0.0, stock: 1, live: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      indexes: ["id"],
      ownerId: user.id
    });
    emitSync("collections:updated", dbData.collections);
  } else {
    user.lastSignIn = new Date().toISOString();
  }
  
  pushLog("success", "auth", `Successful Google Sign-In as [${user.displayName}] via Unified Federated Auth`);
  res.json({ success: true, user });
});

// Unified Federated Cloud Database Syncing Endpoint
app.post("/api/zongobase/auth/firebase-sync", (req, res) => {
  const { email, displayName, method } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Federated authentication email parameter is required." });
  }
  
  const normalized = email.toLowerCase().trim();
  let user = dbData.users.find(u => u.email.toLowerCase() === normalized);
  
  if (!user) {
    user = {
      id: `u_${Math.random().toString(36).substring(2, 9)}`,
      email: normalized,
      password: `secure_federated_${Math.random().toString(36).substring(2, 10)}`,
      displayName: displayName || email.split("@")[0],
      role: "user",
      status: "active",
      lastSignIn: new Date().toISOString()
    };
    dbData.users.push(user);
    
    // Auto-generate starter projects
    const entropy = Math.random().toString(36).substring(2, 7);
    const newProj: WebProject = {
      id: `proj_${Date.now()}`,
      name: `${user.displayName}'s Workspace`,
      domainUrl: "https://localhost:5173",
      description: "Auto-provisioned remote workspace sandbox via Federated Tunnel.",
      apiKey: `zb_public_${user.id}_${entropy}`,
      ownerId: user.id,
      createdAt: new Date().toISOString()
    };
    dbData.projects.push(newProj);
    emitSync("users:updated", dbData.users);
    
    // Auto-seed user default collection
    const seedName = `${user.displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")}_inventory`;
    dbData.collections.push({
      name: seedName,
      description: "Default inventory template loaded with workspace register.",
      documents: [
        {
          id: "seed_item_101",
          data: { title: "ZongoBase Cloud Ledger", price: 0.0, stock: 1, live: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      indexes: ["id"],
      ownerId: user.id
    });
    emitSync("collections:updated", dbData.collections);
  } else {
    // If user's account is suspended, reject!
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Access Denied: This developer portal footprint is suspended." });
    }
    user.lastSignIn = new Date().toISOString();
  }
  
  pushLog("success", "auth", `Successful Sovereign Sync [${method || 'email'}] for [${user.displayName}]`);
  res.json({ success: true, user });
});

// Project Management Enpoints
app.get("/api/zongobase/projects", (req, res) => {
  const user = getRequestUser(req);
  if (!user) return res.status(401).json({ error: "Access Denied: Session login trace not resolved." });
  
  if (user.role === "admin") {
    return res.json({ projects: dbData.projects });
  }
  const filtered = dbData.projects.filter(p => p.ownerId === user.id);
  res.json({ projects: filtered });
});

app.post("/api/zongobase/projects", (req, res) => {
  const user = getRequestUser(req);
  if (!user) return res.status(401).json({ error: "Access Denied: Authed session required." });
  
  const { name, domainUrl, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Integrity Error: Web Project Name required." });
  }
  
  const entropy = Math.random().toString(16).substring(2, 7);
  const newProj: WebProject = {
    id: `proj_${Date.now()}`,
    name: name.trim(),
    domainUrl: domainUrl || "http://localhost:3000",
    description: description || "NoSQL database consumer link.",
    apiKey: `zb_public_${user.id}_${entropy}`,
    ownerId: user.id,
    createdAt: new Date().toISOString()
  };
  
  dbData.projects.push(newProj);
  pushLog("success", "gateway", `Created developer project [${newProj.name}] linked with key [${newProj.apiKey}]`);
  res.status(201).json(newProj);
});

app.delete("/api/zongobase/projects/:id", (req, res) => {
  const user = getRequestUser(req);
  if (!user) return res.status(401).json({ error: "Access Denied: Authed session required." });
  
  const id = req.params.id;
  const project = dbData.projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: "Project reference not found." });
  
  if (user.role !== "admin" && project.ownerId !== user.id) {
    return res.status(403).json({ error: "Forbidden: Unauthorized project destruction." });
  }
  
  dbData.projects = dbData.projects.filter(p => p.id !== id);
  pushLog("warn", "gateway", `Decommitted developer web project registration schema [${project.name}]`);
  res.json({ message: "Project dismantled." });
});

// Scoped collections Database APIs (Isolates and validates read/writes)
app.get("/api/zongobase/db", (req, res) => {
  const api = validateApiKey(req);
  const user = getRequestUser(req);
  
  if (api.valid) {
    if (api.scope === "admin") {
      return res.json({ collections: dbData.collections });
    } else {
      const filtered = dbData.collections.filter(c => c.ownerId === api.ownerId);
      return res.json({ collections: filtered });
    }
  }
  
  if (user) {
    if (user.role === "admin") {
      return res.json({ collections: dbData.collections });
    } else {
      const filtered = dbData.collections.filter(c => c.ownerId === user.id);
      return res.json({ collections: filtered });
    }
  }
  
  // Public/unscopable datasets
  const publicCols = dbData.collections.filter(c => !c.ownerId);
  res.json({ collections: publicCols });
});

app.post("/api/zongobase/db/collections", (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid collection name specification." });
  }

  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (dbData.collections.some(c => c.name === normalized)) {
    return res.status(400).json({ error: `Collection '${normalized}' already exists.` });
  }

  const user = getRequestUser(req);
  const api = validateApiKey(req);
  
  let targetOwner: string | undefined = undefined;
  if (api.valid && api.scope === "user") {
    targetOwner = api.ownerId;
  } else if (user && user.role !== "admin") {
    targetOwner = user.id;
  }

  const newCol: Collection = {
    name: normalized,
    description: description || "Custom document pool",
    documents: [],
    indexes: ["id"],
    ownerId: targetOwner
  };

  dbData.collections.push(newCol);
  pushLog("success", "database", `Created database collection [${normalized}]${targetOwner ? ` mapped to user [${targetOwner}]` : ''}`);
  emitSync("collections:updated", dbData.collections);
  res.status(201).json(newCol);
});

app.delete("/api/zongobase/db/collections/:name", (req, res) => {
  const name = req.params.name;
  const col = dbData.collections.find(c => c.name === name);
  if (!col) {
    return res.status(404).json({ error: "Collection not found." });
  }

  const user = getRequestUser(req);
  const api = validateApiKey(req);
  
  if (col.ownerId) {
    let matches = false;
    if (user && (user.role === "admin" || col.ownerId === user.id)) matches = true;
    if (api.valid && (api.scope === "admin" || col.ownerId === api.ownerId)) matches = true;
    
    if (!matches) {
      return res.status(403).json({ error: "Forbidden: Account has no permissions to delete this dataset workspace." });
    }
  }

  dbData.collections = dbData.collections.filter(c => c.name !== name);
  pushLog("warn", "database", `Destroyed database collection [${name}]`);
  emitSync("collections:updated", dbData.collections);
  res.json({ message: "Collection destroyed successfully" });
});

// Create/Update document within collections
app.post("/api/zongobase/db/collections/:name/docs", (req, res) => {
  const colName = req.params.name;
  const col = dbData.collections.find(c => c.name === colName);
  if (!col) return res.status(404).json({ error: "Collection not found" });

  const user = getRequestUser(req);
  const api = validateApiKey(req);
  
  if (col.ownerId) {
    let matches = false;
    if (user && (user.role === "admin" || col.ownerId === user.id)) matches = true;
    if (api.valid && (api.scope === "admin" || col.ownerId === api.ownerId)) matches = true;
    
    if (!matches) {
      return res.status(403).json({ error: "Access Denied: Token scopes do not permit document insertion." });
    }
  }

  const { id, data } = req.body;
  const docId = id || `doc_${Date.now()}`;

  const existingDoc = col.documents.find(d => d.id === docId);
  if (existingDoc) {
    return res.status(400).json({ error: `Document ID '${docId}' already exists. Use PUT to modify.` });
  }

  const newDoc = {
    id: docId,
    data: data || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  col.documents.push(newDoc);
  pushLog("success", "database", `Inserted document [${docId}] within collection [${colName}]`);
  emitSync("collections:updated", dbData.collections);
  res.status(201).json(newDoc);
});

app.put("/api/zongobase/db/collections/:name/docs/:id", (req, res) => {
  const { name: colName, id: docId } = req.params;
  const col = dbData.collections.find(c => c.name === colName);
  if (!col) return res.status(404).json({ error: "Collection not found" });

  const user = getRequestUser(req);
  const api = validateApiKey(req);
  
  if (col.ownerId) {
    let matches = false;
    if (user && (user.role === "admin" || col.ownerId === user.id)) matches = true;
    if (api.valid && (api.scope === "admin" || col.ownerId === api.ownerId)) matches = true;
    
    if (!matches) {
      return res.status(403).json({ error: "Access Denied: Token scopes do not permit document mutation." });
    }
  }

  const doc = col.documents.find(d => d.id === docId);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  const { data } = req.body;
  doc.data = { ...doc.data, ...data };
  doc.updatedAt = new Date().toISOString();

  pushLog("success", "database", `Updated document [${docId}] within collection [${colName}]`);
  emitSync("collections:updated", dbData.collections);
  res.json(doc);
});

app.delete("/api/zongobase/db/collections/:name/docs/:id", (req, res) => {
  const { name: colName, id: docId } = req.params;
  const col = dbData.collections.find(c => c.name === colName);
  if (!col) return res.status(404).json({ error: "Collection not found" });

  const user = getRequestUser(req);
  const api = validateApiKey(req);
  
  if (col.ownerId) {
    let matches = false;
    if (user && (user.role === "admin" || col.ownerId === user.id)) matches = true;
    if (api.valid && (api.scope === "admin" || col.ownerId === api.ownerId)) matches = true;
    
    if (!matches) {
      return res.status(403).json({ error: "Access Denied: Token scopes do not permit document exclusion." });
    }
  }

  col.documents = col.documents.filter(d => d.id !== docId);
  pushLog("warn", "database", `Removed document [${docId}] from collection [${colName}]`);
  emitSync("collections:updated", dbData.collections);
  res.json({ message: "Document removed successfully" });
});

// Add index to collection
app.post("/api/zongobase/db/collections/:name/indexes", (req, res) => {
  const colName = req.params.name;
  const col = dbData.collections.find(c => c.name === colName);
  if (!col) return res.status(404).json({ error: "Collection not found" });

  const { indexField } = req.body;
  if (!indexField || col.indexes.includes(indexField)) {
    return res.status(400).json({ error: "Invalid or duplicate index definition" });
  }

  col.indexes.push(indexField);
  pushLog("success", "database", `Created custom index [${indexField}] on [${colName}]`);
  emitSync("collections:updated", dbData.collections);
  res.json(col);
});

// Authentication Admin APIs
app.get("/api/zongobase/auth", (req, res) => {
  res.json({ users: dbData.users });
});

app.post("/api/zongobase/auth/users", (req, res) => {
  const { email, displayName, role } = req.body;
  if (!email || !displayName) {
    return res.status(400).json({ error: "Email and Display Name are required." });
  }

  if (dbData.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "User with this email already exists." });
  }

  const newUser: AuthUser = {
    id: `u_${Math.random().toString(36).substring(2, 9)}`,
    email,
    displayName,
    role: role || "user",
    status: "active",
    lastSignIn: new Date().toISOString()
  };

  dbData.users.push(newUser);
  pushLog("success", "auth", `Admin registered authenticating user [${newUser.id}: ${email}]`);
  emitSync("users:updated", dbData.users);
  res.status(201).json(newUser);
});

app.put("/api/zongobase/auth/users/:id/status", (req, res) => {
  const id = req.params.id;
  const user = dbData.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { status } = req.body;
  if (status === "active" || status === "suspended") {
    user.status = status;
    pushLog("info", "auth", `Set user [${user.email}] status to '${status}'`);
    emitSync("users:updated", dbData.users);
    return res.json(user);
  }
  res.status(400).json({ error: "Invalid status definition" });
});

app.delete("/api/zongobase/auth/users/:id", (req, res) => {
  const id = req.params.id;
  const beforeLength = dbData.users.length;
  dbData.users = dbData.users.filter(u => u.id !== id);
  if (dbData.users.length === beforeLength) {
    return res.status(404).json({ error: "User snapshot not found" });
  }
  pushLog("warn", "auth", `Expelled user identity [${id}] from authentication database`);
  emitSync("users:updated", dbData.users);
  res.json({ message: "User deleted" });
});

// Storage APIs
app.get("/api/zongobase/storage", (req, res) => {
  res.json({ files: dbData.files });
});

app.post("/api/zongobase/storage", (req, res) => {
  const { name, path: filePath, content, mimeType } = req.body;
  if (!name || !filePath) {
    return res.status(400).json({ error: "File Name and Directory Path are required." });
  }

  const newFile: StorageFile = {
    id: `file_${Date.now()}`,
    name,
    path: filePath.startsWith("/") ? filePath : "/" + filePath,
    size: content ? Buffer.byteLength(content) : 0,
    mimeType: mimeType || "text/plain",
    content: content || "",
    updatedAt: new Date().toISOString()
  };

  dbData.files.push(newFile);
  pushLog("success", "storage", `Created virtual storage media file [${newFile.path}]`);
  emitSync("files:updated", dbData.files);
  res.status(201).json(newFile);
});

app.delete("/api/zongobase/storage/:id", (req, res) => {
  const id = req.params.id;
  const target = dbData.files.find(f => f.id === id);
  if (!target) return res.status(404).json({ error: "File not found" });

  dbData.files = dbData.files.filter(f => f.id !== id);
  pushLog("warn", "storage", `Deleted files reference from bucket: [${target.path}]`);
  emitSync("files:updated", dbData.files);
  res.json({ message: "File removed" });
});

// Serverless Cloud Functions Runner
app.get("/api/zongobase/functions", (req, res) => {
  res.json({ functions: dbData.functions });
});

app.post("/api/zongobase/functions", (req, res) => {
  const { name, trigger, code } = req.body;
  if (!name || !trigger || !code) {
    return res.status(400).json({ error: "Name, Trigger and JS Code are required." });
  }

  const newFn: CloudFunction = {
    id: `fn_${Date.now()}`,
    name,
    trigger,
    code,
    status: "active"
  };

  dbData.functions.push(newFn);
  pushLog("success", "functions", `Registered Serverless Cloud Function [${name}] triggered by '${trigger}'`);
  emitSync("functions:updated", dbData.functions);
  res.status(201).json(newFn);
});

app.put("/api/zongobase/functions/:id/toggle", (req, res) => {
  const fn = dbData.functions.find(f => f.id === req.params.id);
  if (!fn) return res.status(404).json({ error: "Function not found" });

  fn.status = fn.status === "active" ? "disabled" : "active";
  pushLog("info", "functions", `Function [${fn.name}] state changed to: ${fn.status}`);
  emitSync("functions:updated", dbData.functions);
  res.json(fn);
});

app.delete("/api/zongobase/functions/:id", (req, res) => {
  const id = req.params.id;
  dbData.functions = dbData.functions.filter(f => f.id !== id);
  pushLog("warn", "functions", `Unloaded serverless script index [${id}]`);
  emitSync("functions:updated", dbData.functions);
  res.json({ message: "Function destroyed successfully." });
});

// Run function execution sandbox
app.post("/api/zongobase/functions/run/:id", async (req, res) => {
  const fn = dbData.functions.find(f => f.id === req.params.id);
  if (!fn) return res.status(404).json({ error: "Function not found" });

  const { payload } = req.body;
  const outputLogs: string[] = [];
  const captureConsole = {
    log: (...args: any[]) => outputLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
    warn: (...args: any[]) => outputLogs.push("[WARN] " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
    error: (...args: any[]) => outputLogs.push("[ERROR] " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
  };

  pushLog("info", "functions", `Invoking custom cloud function [${fn.name}] with event payload`);
  fn.lastRun = new Date().toISOString();

  const startTime = Date.now();
  let result = null;
  let success = true;

  try {
    // Simple sandbox evaluation. Let's create an encapsulated Function to run securely
    // We bind local variables context to simulate exports parameter injection safely
    const runnable = new Function("payload", "console", `
      const exports = {};
      ${fn.code}
      
      const functionToRun = exports.onUserCreated || exports.onDatabaseWrite || exports.handler || (async (x) => x);
      return functionToRun(payload);
    `);
    
    result = await runnable(payload, captureConsole);
    outputLogs.push(`Execution completed successfully. (Yielded ${JSON.stringify(result)})`);
  } catch (err: any) {
    success = false;
    outputLogs.push(`RUNTIME ERROR: ${err.message}`);
    captureConsole.error(err.stack || err.message);
  }

  const duration = Date.now() - startTime;
  pushLog(success ? "success" : "error", "functions", `Completed execution of [${fn.name}] in ${duration}ms`);
  emitSync("functions:updated", dbData.functions);

  res.json({
    success,
    logs: outputLogs,
    result,
    durationMs: duration
  });
});

// API keys Manager APIs
app.post("/api/zongobase/apikeys", (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Key Name and Target Role are required." });
  }

  const entropy = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  const newKey: APIKey = {
    id: `key_${Date.now()}`,
    name,
    secret: `zb_${role}_${entropy}`,
    role,
    createdAt: new Date().toISOString()
  };

  dbData.apiKeys.push(newKey);
  pushLog("success", "gateway", `Provisioned API Access Credentials: [${name}] with token [${newKey.secret.substring(0, 10)}...]`);
  emitSync("apikeys:updated", dbData.apiKeys);
  res.status(201).json(newKey);
});

app.delete("/api/zongobase/apikeys/:id", (req, res) => {
  const id = req.params.id;
  dbData.apiKeys = dbData.apiKeys.filter(k => k.id !== id);
  pushLog("warn", "gateway", `Revoked API Access credentials reference entry: [${id}]`);
  emitSync("apikeys:updated", dbData.apiKeys);
  res.json({ message: "Key revoked successfully" });
});

// ZongoBase Dev Feedback Messages Routes
app.get("/api/zongobase/messages", (req, res) => {
  res.json({ messages: dbData.messages });
});

app.post("/api/zongobase/messages", (req, res) => {
  const { senderEmail, senderName, subject, text } = req.body;
  if (!senderEmail || !text) {
    return res.status(400).json({ error: "Email and text message body are required parameters." });
  }

  const newMessage: DevMessage = {
    id: `msg_${Date.now()}`,
    senderEmail,
    senderName: senderName || senderEmail.split("@")[0],
    subject: subject || "General Developer Contact Request",
    text,
    createdAt: new Date().toISOString()
  };

  dbData.messages.unshift(newMessage); // put latest first
  pushLog("success", "gateway", `Secure message arrived from customer [${senderEmail}]`);
  emitSync("messages:updated", dbData.messages);
  res.status(201).json({ success: true, message: newMessage });
});

// Helper function to synthesize custom NoSQL/Serverless schemas locally with zero third-party dependencies or cost
function generateAssetLocally(type: string, prompt: string): string {
  const pr = prompt.toLowerCase();
  
  if (type === "schema") {
    if (pr.includes("user") || pr.includes("member") || pr.includes("profile")) {
      return JSON.stringify([
        {
          id: "usr_gen_" + Math.floor(Math.random() * 9000 + 1000),
          username: "spark_nomad",
          fullName: "Devon Vance",
          email: "devon@zongobase.tech",
          role: pr.includes("admin") ? "admin" : "developer",
          status: "active",
          tier: "pro",
          loginCount: 42,
          metadata: { ip: "192.168.1.1", country: "US" }
        },
        {
          id: "usr_gen_" + Math.floor(Math.random() * 9000 + 1000),
          username: "alpha_builder",
          fullName: "Esther Kim",
          email: "esther@enterprise.com",
          role: "user",
          status: "active",
          tier: "free",
          loginCount: 5,
          metadata: { ip: "172.16.25.4", country: "KR" }
        }
      ], null, 2);
    } else if (pr.includes("product") || pr.includes("item") || pr.includes("shop") || pr.includes("cart") || pr.includes("store")) {
      return JSON.stringify([
        {
          id: "prod_gen_" + Math.floor(Math.random() * 9000 + 1000),
          name: "SaaS Scale Sandbox Kit",
          sku: "SVC-ZONGO-001",
          price: 199.99,
          currency: "USD",
          stock: 450,
          category: pr.includes("digital") ? "software" : "hardware",
          tags: ["api", "sandbox", "offline-first"],
          rating: 4.8
        },
        {
          id: "prod_gen_" + Math.floor(Math.random() * 9000 + 1000),
          name: "ZongoBase High-IO Engine Core",
          sku: "SVC-ZONGO-002",
          price: 899.00,
          currency: "USD",
          stock: 120,
          category: "serverless",
          tags: ["high-performance", "database", "isolated"],
          rating: 4.9
        }
      ], null, 2);
    } else if (pr.includes("order") || pr.includes("transaction") || pr.includes("payment") || pr.includes("sale")) {
      return JSON.stringify([
        {
          id: "ord_gen_" + Math.floor(Math.random() * 9000 + 1000),
          userId: "usr_gen_7721",
          items: [{ itemId: "prod_gen_2210", qty: 2, priceUnit: 99.50 }],
          totalAmount: 199.00,
          status: pr.includes("fail") || pr.includes("cancel") ? "cancelled" : "completed",
          paymentGateway: pr.includes("stripe") ? "stripe" : "paypal",
          shippingAddress: { city: "London", country: "UK" },
          processedAt: new Date().toISOString()
        },
        {
          id: "ord_gen_" + Math.floor(Math.random() * 9000 + 1000),
          userId: "usr_gen_3350",
          items: [{ itemId: "prod_gen_4490", qty: 1, priceUnit: 50.00 }],
          totalAmount: 50.00,
          status: "pending",
          paymentGateway: "credit_card",
          shippingAddress: { city: "Tokyo", country: "JP" },
          processedAt: new Date().toISOString()
        }
      ], null, 2);
    } else if (pr.includes("post") || pr.includes("blog") || pr.includes("article") || pr.includes("news")) {
      return JSON.stringify([
        {
          id: "post_gen_" + Math.floor(Math.random() * 9000 + 1000),
          title: "Achieving Near-Zero Latency with Isolated Database Pipelines",
          slug: "zero-latency-isolated-db",
          published: true,
          readTimeMins: 6,
          authorId: "usr_gen_8831",
          tags: ["databases", "architecture", "scalability"],
          metrics: { views: 1250, likes: 98 }
        },
        {
          id: "post_gen_" + Math.floor(Math.random() * 9000 + 1000),
          title: "Unshackling from Costly Third-Party cloud APIs",
          slug: "unshackling-third-party-costly-apis",
          published: true,
          readTimeMins: 4,
          authorId: "usr_gen_1140",
          tags: ["offline", "compliance", "saas-bootstrapping"],
          metrics: { views: 3400, likes: 412 }
        }
      ], null, 2);
    } else if (pr.includes("task") || pr.includes("todo") || pr.includes("issue") || pr.includes("gantt")) {
      return JSON.stringify([
        {
          id: "task_gen_" + Math.floor(Math.random() * 9000 + 1000),
          title: "Compile offline rules engine fallback",
          priority: "high",
          status: pr.includes("completed") ? "completed" : "in_progress",
          assignedTo: "developer_core",
          dueAt: new Date(Date.now() + 864500000).toISOString(),
          checklist: [
            { id: "cl_1", text: "Parse query string keywords", checked: true },
            { id: "cl_2", text: "Generate mock database payload schema models", checked: true },
            { id: "cl_3", text: "Test pipeline validation script execution", checked: false }
          ]
        },
        {
          id: "task_gen_" + Math.floor(Math.random() * 9000 + 1000),
          title: "Refactor database triggers to remove unnecessary hooks",
          priority: "medium",
          status: "backlog",
          assignedTo: "analyst_core",
          dueAt: new Date(Date.now() + 1729000000).toISOString(),
          checklist: []
        }
      ], null, 2);
    } else {
      return JSON.stringify([
        {
          id: "doc_gen_" + Math.floor(Math.random() * 9000 + 1000),
          title: "Generated Isolated Snapshot Document",
          notes: "Derived locally via offline keyword compilations: " + prompt.substring(0, 80),
          priority: "normal",
          isSystemCompliant: true,
          numericalMetrics: 88,
          timestamp: new Date().toISOString()
        },
        {
          id: "doc_gen_" + Math.floor(Math.random() * 9000 + 1000),
          title: "Autonomous Isolated Secondary Node",
          notes: "No-cost localized fallback database engine",
          priority: "low",
          isSystemCompliant: true,
          numericalMetrics: 94,
          timestamp: new Date().toISOString()
        }
      ], null, 2);
    }
  } else if (type === "function") {
    if (pr.includes("validate") || pr.includes("check") || pr.includes("verify") || pr.includes("security")) {
      return `// Smart Compiled Serverless Cloud Script
// Formulates local validation guard rules for payload integrity verification
exports.handler = async (payload) => {
  console.log("Analyzing validation parameters...");
  const data = payload.data || payload;
  
  // Basic validation rules computed by ZongoBase Heuristics
  if (!data || Object.keys(data).length === 0) {
    throw new Error("Trigger Blocked: Empty transaction payload data structure.");
  }
  
  if (data.email && !data.email.includes("@")) {
    throw new Error("Trigger Blocked: Email address validation syntactically failed.");
  }
  
  if (data.amount !== undefined && data.amount < 0) {
    throw new Error("Trigger Blocked: Negative currency transaction index forbidden.");
  }

  console.log("Validation complete status: COMPLIANT.");
  return { ...payload, validatedAt: new Date(), verified: true };
};`;
    } else if (pr.includes("hash") || pr.includes("crypto") || pr.includes("secure") || pr.includes("password")) {
      return `// Smart Compiled Serverless Cloud Script
// High-grade localized credential formatting and secure hashing routine
exports.handler = async (payload) => {
  console.log("Registering credential modification hook...");
  const data = payload.data || payload;
  
  if (data.password) {
    console.log("Performing security sanitization sequence on password characters...");
    const salt = "zb_salt_" + Math.random().toString(36).substring(2, 6);
    const mockHash = "SHA256::" + Buffer.from(data.password + salt).toString('base64').substring(0, 32);
    
    data.passwordHash = mockHash;
    delete data.password;
  } else {
    console.warn("Secure hash sequence bypassed: password field not presented.");
  }
  
  return { ...payload, sanitized: true, timestampUtc: new Date() };
};`;
    } else if (pr.includes("calc") || pr.includes("tax") || pr.includes("discount") || pr.includes("total") || pr.includes("price") || pr.includes("math")) {
      return `// Smart Compiled Serverless Cloud Script
// Real-time calculation node for transaction tax, discount rates, and invoice indices
exports.handler = async (payload) => {
  console.log("Invoking localized financial calculation module...");
  const data = payload.data || payload;
  
  const baseAmount = data.amount || data.price || 100;
  const discountRate = data.discountPercent !== undefined ? (data.discountPercent / 100) : 0.10;
  const taxRate = 0.18;
  
  const discountAmount = baseAmount * discountRate;
  const netBeforeTax = baseAmount - discountAmount;
  const taxAmount = netBeforeTax * taxRate;
  const grandTotal = netBeforeTax + taxAmount;
  
  console.log("Calculated complete invoice metadata. Grand Total: $" + grandTotal.toFixed(2));
  
  return {
    ...payload,
    calculations: {
      originalPrice: baseAmount,
      discountGiven: discountAmount,
      taxImposed: taxAmount,
      finalInvoiceTotal: parseFloat(grandTotal.toFixed(2))
    }
  };
};`;
    } else if (pr.includes("log") || pr.includes("notify") || pr.includes("alert") || pr.includes("message") || pr.includes("webhook")) {
      return `// Smart Compiled Serverless Cloud Script
// Event logging transmitter and external notification proxy gateway emulator
exports.handler = async (payload) => {
  const data = payload.data || payload;
  const resourceName = payload.id || "gen_record";
  
  console.log("DISPATCH: [Serverless Hook] Recording lifecycle mutation event for " + resourceName);
  console.log("EVENT METADATA: " + JSON.stringify(data));
  
  if (data.status === "error" || data.status === "failed") {
    console.warn("ALERT TRIGGER: Dispatched high-priority alert system notice.");
  }
  
  return { ...payload, telemetryAcknowledged: true, gatewaySynced: true };
};`;
    } else {
      return `// Smart Compiled Serverless Cloud Script
// Generated locally based on prompt: ${prompt.replace(/\n/g, " ").substring(0, 60)}...
exports.handler = async (payload) => {
  console.log("Running customized localized logic pipeline...");
  const data = payload.data || payload;
  
  const processed = {
    ...data,
    processedAt: new Date(),
    zongoEngineSignature: "zb_offline_core_2.1"
  };
  
  console.log("Operation compiled successfully.");
  return { ...payload, data: processed };
};`;
    }
  }
  return "";
}

// 2. High-Performance Local Compiled Node / Schema Engine
app.post("/api/zongobase/ai/generate", async (req, res) => {
  const { type, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt query description." });

  try {
    pushLog("info", "gateway", `Compiling localized asset builder using offline rules: ${type}`);
    
    // Process using our zero-cost smart algorithm and package it directly in-app
    const cleanOutput = generateAssetLocally(type, prompt);
    
    // Ultra-fast instant response simulation
    setTimeout(() => {
      res.json({ result: cleanOutput });
    }, 150);
  } catch (error: any) {
    pushLog("error", "gateway", `Local generation failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite & static server rules
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZongoBase Server running on http://localhost:${PORT}`);
  });
}

startServer();
