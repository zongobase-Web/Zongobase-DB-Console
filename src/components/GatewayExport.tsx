import React, { useState } from 'react';
import { Network, FileCode, Check, Copy, HelpCircle, HardDrive, Cpu, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function GatewayExport() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'js' | 'python' | 'curl' | 'php_server' | 'node_server'>('js');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const snippets = {
    js: `// 1. Initialize the ZongoBase DB Client connection
const ZONGOBASE_SERVER_URL = "https://your-zongobase-hosted-domain.net";
const API_TOKEN = "zb_root_8fa2c30dfbe0e81bac8a0029b3cef"; // Keep server-side!

class ZongoBaseDB {
  static async insertDocument(collection, docId, data) {
    const res = await fetch(\`\${ZONGOBASE_SERVER_URL}/api/zongobase/db/collections/\${collection}/docs\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${API_TOKEN}\`
      },
      body: JSON.stringify({ id: docId, data })
    });
    return res.json();
  }

  static async registerUser(email, displayName, role = "user") {
    const res = await fetch(\`\${ZONGOBASE_SERVER_URL}/api/zongobase/auth/users\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${API_TOKEN}\`
      },
      body: JSON.stringify({ email, displayName, role })
    });
    return res.json();
  }
}

// Example deployment execution:
ZongoBaseDB.insertDocument("users_profile", "usr_1003", {
  username: "clara_tech",
  plan: "premium",
  registeredAt: new Date()
}).then(console.log);`,

    python: `# Install requests module: pip install requests
import requests

ZONGOBASE_SERVER_URL = "https://your-zongobase-hosted-domain.net"
API_TOKEN = "zb_root_8fa2c30dfbe0e81bac8a0029b3cef"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_TOKEN}"
}

# 1. Insert Database Document
doc_payload = {
    "id": "usr_python_99",
    "data": {
        "client": "Python SDK wrapper",
        "active": True,
        "queriesCount": 4210
    }
}
response = requests.post(
    f"{ZONGOBASE_SERVER_URL}/api/zongobase/db/collections/users_profile/docs",
    headers=headers,
    json=doc_payload
)
print("Doc insertion result:", response.json())`,

    curl: `# 1. Insert NoSQL Doc Node via cURL Gateway
curl -X POST "https://your-zongobase-hosted-domain.net/api/zongobase/db/collections/orders/docs" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer zb_root_8fa2c30dfbe0e81bac8a0029b3cef" \\
     -d '{
       "id": "ord_curl_4812",
       "data": {
         "item": "Modular Silicon Router",
         "amount": 299.50,
         "client": "CLI command line"
       }
     }'`,

    php_server: `<?php
/**
 * Standalone Portable PHP ZongoBase Database Server
 * Save as 'zongobase_server.php'. Run with PHP 7.4+ (Apache/Nginx VPS).
 * Creates JSON file-backed collections under a secure folder.
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit(0);
}

// Config & Directory rules
$DB_ROOT = __DIR__ . "/zongobase_data";
$API_TOKEN = "zb_root_8fa2c30dfbe0e81bac8a0029b3cef";

if (!file_exists($DB_ROOT)) {
    mkdir($DB_ROOT, 0755, true);
}

// Simple Security filter
$headers = getallheaders();
$authHeader = isset($headers["Authorization"]) ? $headers["Authorization"] : "";
if ($authHeader !== "Bearer " . $API_TOKEN) {
    http_response_code(401);
    echo json_encode(["error" => "Access denied. Invalid or missing Bearer Auth Token."]);
    exit();
}

$requestUri = $_SERVER["REQUEST_URI"];
$method = $_SERVER["REQUEST_METHOD"];

// Route parsing (Matches pattern: /api/zongobase/db/collections/{col}/docs)
if (preg_match('/\\/api\\/zongobase\\/db\\/collections\\/([a-zA-Z0-9_]+)\\/docs/', $requestUri, $matches)) {
    $collection = $matches[1];
    $col_file = "$DB_ROOT/$collection.json";
    
    $docsArray = [];
    if (file_exists($col_file)) {
        $docsArray = json_decode(file_get_contents($col_file), true) ?: [];
    }
    
    if ($method === "GET") {
        echo json_encode(["documents" => $docsArray]);
        exit();
    }
    
    if ($method === "POST") {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || !isset($input["data"])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid document data payload"]);
            exit();
        }
        
        $docId = isset($input["id"]) ? $input["id"] : "doc_" . uniqid();
        $newDoc = [
            "id" => $docId,
            "data" => $input["data"],
            "createdAt" => date("c"),
            "updatedAt" => date("c")
        ];
        
        $docsArray[] = $newDoc;
        file_put_contents($col_file, json_encode($docsArray, JSON_PRETTY_PRINT));
        
        echo json_encode($newDoc);
        exit();
    }
}

http_response_code(444);
echo json_encode(["error" => "Endpoint not hosted on standalone gateway."]);`,

    node_server: `/**
 * Standalone NodeJS Portable ZongoBase Server
 * Save as 'index.js'. Run on Netlify, Render, Vercel or local machine.
 * Runs in-memory with automatic JSON persistence buffers.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db_persistence.json");
const MASTER_SECRET = "zb_root_8fa2c30dfbe0e81bac8a0029b3cef";

let db = { collections: {} };
if (fs.existsSync(DB_FILE)) {
  try { db = JSON.parse(fs.readFileSync(DB_FILE)); } catch (e) {}
}

const persist = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// Security Gate
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== \`Bearer \${MASTER_SECRET}\`) {
    return res.status(401).json({ error: "Access denied. Invalid or missing API token." });
  }
  next();
});

// REST routes
app.post("/api/zongobase/db/collections/:name/docs", (req, res) => {
  const colName = req.params.name;
  if (!db.collections[colName]) db.collections[colName] = [];
  
  const { id, data } = req.body;
  const docId = id || "doc_" + Date.now();
  
  const newDoc = {
    id: docId,
    data: data || {},
    createdAt: new Date().toISOString()
  };
  
  db.collections[colName].push(newDoc);
  persist();
  res.status(201).json(newDoc);
});

app.get("/api/zongobase/db/collections/:name", (req, res) => {
  const colName = req.params.name;
  res.json({ documents: db.collections[colName] || [] });
});

app.listen(PORT, () => {
  console.log(\`Portable ZongoBase Node DB running on port \${PORT}\`);
});`
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual walkthrough instructions */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <span>Own & Control Your Data</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            ZongoBase gives you 100% architectural transparency. You can use the copyable Standalone Scripts in the editor tab to run your own servers!
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-cyan-400 shrink-0 mt-0.5">1</div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Choose host platform</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Move files to GitHub and host for free on Netlify, Render, or any private PHP Apache Apache/Nginx shared hosting server.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-400 shrink-0 mt-0.5">2</div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Connect client SDK</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Import standard fetch patterns into your React front-end or mobile application using custom tokens generated in security controls.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-400 shrink-0 mt-0.5">3</div>
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Run serverless code</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Add custom NodeJS triggers to automate ledger events and perform third-party webhooks integrations immediately on write.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/30">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Flexible integrations</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Because ZongoBase APIs adhere to standard REST paradigms, any client-side tool supporting HTTP (Flutter, Unity, Vue, Swift, Java, Kotlin) is fully compatible out of the box with zero custom libraries required.
          </p>
        </div>
      </div>

      {/* Code Snip panels */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden flex flex-col h-[520px]">
        {/* Toggle selectors */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveLang('js')}
            className={`px-3 py-1 rounded font-mono text-xs font-semibold border transition ${
              activeLang === 'js'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            JS Client SDK
          </button>
          <button
            onClick={() => setActiveLang('python')}
            className={`px-3 py-1 rounded font-mono text-xs font-semibold border transition ${
              activeLang === 'python'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Python SDK
          </button>
          <button
            onClick={() => setActiveLang('curl')}
            className={`px-3 py-1 rounded font-mono text-xs font-semibold border transition ${
              activeLang === 'curl'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            cURL Request
          </button>
          <button
            onClick={() => setActiveLang('php_server')}
            className={`px-3 py-1 rounded font-mono text-xs font-semibold border transition ${
              activeLang === 'php_server'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Standalone PHP server
          </button>
          <button
            onClick={() => setActiveLang('node_server')}
            className={`px-3 py-1 rounded font-mono text-xs font-semibold border transition ${
              activeLang === 'node_server'
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Standalone Node server
          </button>
        </div>

        {/* Code Content text */}
        <div className="p-4 bg-slate-950 text-emerald-450 font-mono text-[11px] overflow-y-auto flex-1 relative leading-relaxed text-left">
          <button
            onClick={() => copyToClipboard(snippets[activeLang], activeLang)}
            className="absolute top-4 right-4 p-2 bg-slate-900 hover:bg-slate-800 hover:border-cyan-500/20 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Copy snippet"
          >
            {copiedKey === activeLang ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <pre>{snippets[activeLang]}</pre>
        </div>
      </div>
    </div>
  );
}
