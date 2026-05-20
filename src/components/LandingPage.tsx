import React, { useState } from "react";
import { 
  Database, Shield, Cpu, HardDrive, KeyRound, Globe, Terminal, 
  ArrowRight, Sparkles, Check, Zap, Server, Code, Play, 
  Layers, Lock, HelpCircle, CornerDownRight, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onGoToConsole: () => void;
}

export default function LandingPage({ onGoToConsole }: LandingPageProps) {
  const [activeTabCode, setActiveTabCode] = useState<"javascript" | "react" | "curl" | "rust">("react");
  
  // Interactive Live Pricing Simulator
  const [monthlyRequests, setMonthlyRequests] = useState<number>(250000);
  
  // Code snippet options
  const snippets = {
    javascript: `// Initialize the ZongoBase Real-Time Node
import { ZongoClient } from "@zongobase/sdk";

const db = new ZongoClient({
  endpoint: "https://db.zongobase.com/api",
  projectKey: "zb_proj_live_94f27a"
});

// Write nested schema documents
await db.collection("orders_db").insert({
  id: "order_9801",
  data: {
    customer: "Elena Rostova",
    status: "processing",
    amount: 1420
  }
});`,
    react: `// React real-time multi-tenant reactive hook
import { useZongoSync } from "@zongobase/react";

export function LiveDashboard() {
  const { data: records, isConnected } = useZongoSync({
    collection: "leads_db",
    sortBy: "timestamp_desc"
  });

  return (
    <div className="flex items-center gap-2">
      <span className={isConnected ? "text-blue-400" : "text-slate-500"} />
      <span>{records.length} Leads Synchronized</span>
    </div>
  );
}`,
    curl: `# Fetch secure multi-tenant collections directly via HTTP API
curl -X GET "https://db.zongobase.com/api/zongobase/db" \\
  -H "Authorization: Bearer zb_proj_live_94f27a" \\
  -H "Content-Type: application/json"`,
    rust: `// High-performance typed async connection thread
let client = ZongoClient::new(
    "https://db.zongobase.com/api",
    "zb_proj_live_94f27a"
).unwrap();

let doc = client.collection("analytics")
    .find_one("session_active_38")
    .await?;`
  };

  return (
    <div id="landing-container" className="min-h-screen bg-[#131416] text-[#f0f4f9] font-sans selection:bg-[#8ab4f8]/30 selection:text-white overflow-x-hidden relative">
      
      {/* Decorative Grid overlays */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50" />
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#4285f4]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#9b51e0]/4 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#2d2f31] to-transparent" />

      {/* Navigation header matching premium Google Dev styles */}
      <nav className="border-b border-[#2d2f31] bg-[#131416]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Gemini sparkling star logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4285f4] via-[#9b51e0] to-[#e040fb] rounded-md blur-sm opacity-65 group-hover:opacity-100 transition-opacity" />
              <div className="w-8 h-8 rounded-lg bg-[#1e1f20] border border-[#2d2f31] flex items-center justify-center relative">
                <Sparkles className="w-4.5 h-4.5 text-[#8ab4f8]" />
              </div>
            </div>
            
            <span className="text-base font-extrabold tracking-tight text-white font-sans">
              Zongo<span className="bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#e040fb] bg-clip-text text-transparent">Base</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-[#1e1f20] border border-[#2d2f31] text-[#c4c7c5] font-mono px-2 py-0.5 rounded-full">
              Engine v2.3
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#c4c7c5]">
            <a href="#features" className="hover:text-white transition-colors">Core Features</a>
            <a href="#architecture" className="hover:text-[#8ab4f8] transition-colors">NoSQL Advantage</a>
            <a href="#developer-sandbox" className="hover:text-white transition-colors">SDK Sandbox</a>
            <a href="#simulator" className="hover:text-white transition-colors">Resource Predictor</a>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#8ab4f8] bg-[#4285f4]/10 border border-[#4285f4]/20 px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8ab4f8] animate-pulse" />
              <span>Nodes: Synced</span>
            </span>
            <button
              onClick={onGoToConsole}
              id="nav-go-console"
              className="bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#131416] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-900/10"
            >
              <span>Console</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto text-center space-y-8 select-none">
        
        {/* Gemini Spark highlight tag */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1e1f20] border border-[#2d2f31] text-[#8ab4f8] text-xs font-mono font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>The Sovereign Self-Hosted Workspace & NoSQL Datastore Linker</span>
        </motion.div>

        {/* Gemini text-gradient titles */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-sans tracking-tight font-extrabold max-w-4xl mx-auto leading-[1.1] text-[#f0f4f9]"
        >
          NoSQL Core Engine built for <span className="bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#e040fb] bg-clip-text text-transparent">Instant Scale</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#c4c7c5] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          A highly-autonomous, cost-free database playground. Experience dynamic collections, multi-tenant workspace isolation, fast real-time synchronization, and serverless Cloud functions styled inside an elegant software sandbox.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <button
            onClick={onGoToConsole}
            id="hero-get-started"
            className="w-full sm:w-auto bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#131416] font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-md cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span>Launch Database Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="#developer-sandbox"
            className="w-full sm:w-auto bg-[#1e1f20] hover:bg-[#252628] border border-[#2d2f31] hover:border-[#3c4043] text-[#f0f4f9] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <span>Preview API Sandbox</span>
          </a>
        </motion.div>

        {/* Global Statistics Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-[#1e1f20] border border-[#2d2f31] rounded-2xl max-w-5xl mx-auto text-left font-mono mt-12 divide-y md:divide-y-0 md:divide-x divide-[#2d2f31]"
        >
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Cold Start Latency</div>
            <div className="text-2xl font-extrabold text-[#f0f4f9] mt-1 font-sans">0.02ms</div>
            <div className="text-[10px] text-[#8ab4f8] mt-0.5">🚀 Memory Isolated Router</div>
          </div>
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Event Synchronization</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-sans">Instant</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Persistent Server-Sent Events</div>
          </div>
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Standalone Bundle</div>
            <div className="text-2xl font-extrabold text-[#f0f4f9] mt-1 font-sans">&lt; 15MB</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Optimized standalone bundle</div>
          </div>
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Database Billing</div>
            <div className="text-2xl font-extrabold text-[#8ab4f8] mt-1 font-sans">100% Free</div>
            <div className="text-[10px] text-slate-400 mt-0.5">No hosting bills, infinite limits</div>
          </div>
        </motion.div>
      </section>

      {/* Features bento section in charcoal panels */}
      <section id="features" className="py-20 px-6 border-t border-[#2d2f31] max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold text-[#8ab4f8] uppercase tracking-widest block">ALL-IN-ONE SYSTEM ARCHITECTURE</span>
          <h2 className="text-3xl font-sans tracking-tight font-extrabold text-white">Full-Stack Autonomy out of the box</h2>
          <p className="text-slate-400 text-xs">ZongoBase integrates five core distributed cloud micro-services into one single robust application container.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#1e1f20] border border-[#2d2f31] p-6 sm:p-8 rounded-2xl relative overflow-hidden group hover:border-[#8ab4f8]/30 transition-all duration-300">
            <Database className="w-8 h-8 text-[#8ab4f8] mb-4" />
            <h3 className="text-base font-bold text-white font-sans">Query NoSQL Database</h3>
            <p className="text-[#c4c7c5] text-xs mt-2 leading-relaxed">
              Create collections, store JSON documents, and configure index pathways. Fast reads/writes ensure ultra-high telemetry query delivery under multi-threaded loads.
            </p>
            <ul className="text-[10px] font-mono text-slate-400 space-y-1.5 mt-4">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#8ab4f8]" /> High speed cache pools</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#8ab4f8]" /> Strict multi-tenant isolation</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1e1f20] border border-[#2d2f31] p-6 sm:p-8 rounded-2xl relative overflow-hidden group hover:border-[#8ab4f8]/30 transition-all duration-300">
            <Cpu className="w-8 h-8 text-[#8ab4f8] mb-4" />
            <h3 className="text-base font-bold text-white font-sans">Reactive Cloud Scripts</h3>
            <p className="text-[#c4c7c5] text-xs mt-2 leading-relaxed">
              Write functional JavaScript code triggered on collection mutations. Create serverless triggers for data integrations, webhook alerts, or schema verifications safely in-app.
            </p>
            <ul className="text-[10px] font-mono text-slate-400 space-y-1.5 mt-4">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#8ab4f8]" /> Sandboxed JavaScript runtime</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#8ab4f8]" /> Real-time console logs trace</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1e1f20] border border-[#2d2f31] p-6 sm:p-8 rounded-2xl relative overflow-hidden group hover:border-[#8ab4f8]/30 transition-all duration-300">
            <HardDrive className="w-8 h-8 text-[#8ab4f8] mb-4" />
            <h3 className="text-base font-bold text-white font-sans">Sleek Asset Buckets</h3>
            <p className="text-[#c4c7c5] text-xs mt-2 leading-relaxed">
              Drop static files, images, code configs, or schemas cleanly via the browser. Full metadata mapping generates direct client URL vectors to fetch images/media without CDN delays.
            </p>
            <ul className="text-[10px] font-mono text-slate-400 space-y-1.5 mt-4">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#8ab4f8]" /> Direct Base64 file mapping</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#8ab4f8]" /> 1-Click path deletion control</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Code SDK Sandbox Panel */}
      <section id="developer-sandbox" className="py-20 px-6 border-t border-[#2d2f31] bg-[#1a1b1e]/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#4285f4]/15 border border-[#4285f4]/25 text-[#8ab4f8] font-mono text-[9px] font-bold uppercase tracking-wider">
              <span>SDK Sandbox</span>
            </span>
            <h2 className="text-3xl font-sans font-extrabold text-white tracking-tight">
              One Unified SDK. Connect any project in under four lines.
            </h2>
            <p className="text-[#c4c7c5] text-xs leading-relaxed">
              Skip complex configurations. Use client public keys paired with remote domains. Connect single-page apps (React, Vue), mobile wrappers, or backends, and synchronize datasets across nodes instantly.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 h-10 w-10 shrink-0 bg-[#1e1f20] border border-[#2d2f31] rounded-lg flex items-center justify-center text-[#8ab4f8]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Independent Core Tenant Slots</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">New workspace environments receive secure isolation on the Express core. No database leaks.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 h-10 w-10 shrink-0 bg-[#1e1f20] border border-[#2d2f31] rounded-lg flex items-center justify-center text-[#8ab4f8]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">CORS Origin Security</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Requests receive validation matches on both project keys and current domain host headers to prevent unauthorized scrapers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Switcher Widget */}
          <div className="bg-[#1e1f20] border border-[#2d2f31] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#131416]/80 border-b border-[#2d2f31] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-slate-400 text-xs">
                <Terminal className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>ZONGOBASE_SDK_HOOK</span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">Standard API</span>
            </div>

            <div className="flex bg-[#131416] border-b border-[#2d2f31]/60 text-xs text-[#c4c7c5] font-mono">
              <button
                onClick={() => setActiveTabCode("react")}
                className={`flex-1 py-3 text-center border-b font-semibold transition-all cursor-pointer ${activeTabCode === "react" ? "text-[#8ab4f8] bg-[#1e1f20] border-[#8ab4f8]" : "border-transparent hover:text-white"}`}
              >
                React Hook
              </button>
              <button
                onClick={() => setActiveTabCode("javascript")}
                className={`flex-1 py-3 text-center border-b font-semibold transition-all cursor-pointer ${activeTabCode === "javascript" ? "text-[#8ab4f8] bg-[#1e1f20] border-[#8ab4f8]" : "border-transparent hover:text-white"}`}
              >
                Vanilla JS
              </button>
              <button
                onClick={() => setActiveTabCode("curl")}
                className={`flex-1 py-3 text-center border-b font-semibold transition-all cursor-pointer ${activeTabCode === "curl" ? "text-[#8ab4f8] bg-[#1e1f20] border-[#8ab4f8]" : "border-transparent hover:text-white"}`}
              >
                cURL Raw
              </button>
              <button
                onClick={() => setActiveTabCode("rust")}
                className={`flex-1 py-3 text-center border-b font-semibold transition-all cursor-pointer ${activeTabCode === "rust" ? "text-emerald-400 bg-[#1e1f20] border-emerald-500" : "border-transparent hover:text-white"}`}
              >
                Rust Thread
              </button>
            </div>

            <div className="p-6 relative">
              <pre className="text-[11.5px] font-mono text-slate-300 leading-relaxed overflow-x-auto select-all max-h-72">
{snippets[activeTabCode]}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="architecture" className="py-20 px-6 border-t border-[#2d2f31] max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold text-[#8ab4f8] uppercase tracking-widest block">COMPARATIVE METRICS</span>
          <h2 className="text-3xl font-sans tracking-tight font-extrabold text-white">How we line up against giants</h2>
          <p className="text-slate-400 text-xs">Comparison of core architecture overheads between standalone sandbox structures and heavy cloud stacks.</p>
        </div>

        <div className="bg-[#1e1f20] border border-[#2d2f31] rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-[#131416]/90 border-b border-[#2d2f31] font-mono text-[9px] text-[#c4c7c5] uppercase tracking-widest">
                <th className="p-4 sm:p-5 font-bold">Metrics Dimension</th>
                <th className="p-4 sm:p-5 font-bold text-[#8ab4f8] bg-[#8ab4f8]/5">ZongoBase Engine</th>
                <th className="p-4 sm:p-5 font-bold">Mainstream Heavy NoSQL DB</th>
                <th className="p-4 sm:p-5 font-bold">Supabase Postgres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2f31] text-slate-300">
              <tr className="hover:bg-[#131416]/30 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-white">Direct Cold Start Delay</td>
                <td className="p-4 sm:p-5 bg-[#8ab4f8]/5 text-emerald-400 font-mono font-bold">0.02ms (Direct Cache Memory)</td>
                <td className="p-4 sm:p-5 text-slate-500">120ms to 450ms (Cloud Sleep)</td>
                <td className="p-4 sm:p-5 text-slate-500">300ms to 800ms (Container bootup)</td>
              </tr>
              <tr className="hover:bg-[#131416]/30 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-white">Real-Time Sync Channel</td>
                <td className="p-4 sm:p-5 bg-[#8ab4f8]/5 text-white font-mono flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#8ab4f8] fill-blue-500/10" />
                  <span>Onboard Server-Sent Events</span>
                </td>
                <td className="p-4 sm:p-5">Heavy WebSocket listener load</td>
                <td className="p-4 sm:p-5">Requires configuration nodes</td>
              </tr>
              <tr className="hover:bg-[#131416]/30 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-white">Project-Level Isolation</td>
                <td className="p-4 sm:p-5 bg-[#8ab4f8]/5 text-emerald-400 font-mono font-bold">Yes (Absolute Sandbox Origin)</td>
                <td className="p-4 sm:p-5 text-slate-400">Complex Firestore security loops</td>
                <td className="p-4 sm:p-5 text-slate-400">Requires strict Row Level Policies</td>
              </tr>
              <tr className="hover:bg-[#131416]/30 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-white">Local Standalone Footprint</td>
                <td className="p-4 sm:p-5 bg-[#8ab4f8]/5 text-emerald-400 font-mono font-bold">&lt; 15MB Single Binary Size</td>
                <td className="p-4 sm:p-5 text-slate-500">No (Requires GCP link)</td>
                <td className="p-4 sm:p-5 text-slate-500">Complex Docker local orchestration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Simulated Overheads Predictive Bar */}
      <section id="simulator" className="py-20 px-6 border-t border-[#2d2f31] bg-[#1a1b1e]/10">
        <div className="max-w-5xl mx-auto bg-[#1e1f20] border border-[#2d2f31] p-6 sm:p-10 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[9px] font-mono text-[#8ab4f8] uppercase tracking-widest font-bold">DATABASE SCALE SIMULATOR</span>
              <h3 className="text-2xl font-sans font-extrabold text-[#f0f4f9]">Compute machine resources instantly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag the hardware slider to simulate incoming database read/write queries. See how light standalone compiled loops process transaction states.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>MONTHLY DOCUMENT OPERATIONS</span>
                  <span className="text-[#8ab4f8] font-bold">{monthlyRequests.toLocaleString()} transactions</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={monthlyRequests}
                  onChange={(e) => setMonthlyRequests(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded bg-slate-800 accent-[#8ab4f8] cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-[#131416] border border-[#2d2f31] p-6 rounded-xl space-y-4 font-mono text-xs">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">Estimated Core Metrics</div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#c4c7c5]">ZongoBase Cpu Core Overhead:</span>
                <span className="text-emerald-400 font-bold">{(monthlyRequests / 2400000).toFixed(2)}% Cpu Core</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#c4c7c5]">Container Memory Footprint:</span>
                <span className="text-emerald-400 font-bold">{(10 + (monthlyRequests / 120000)).toFixed(1)} MB RAM</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#c4c7c5]">Monthly Platform Billing:</span>
                <span className="text-emerald-400 font-bold">$0.00 / completely cost-free</span>
              </div>

              <div className="border-t border-[#2d2f31] pt-3">
                <span className="text-[10px] text-[#8ab4f8] flex items-center gap-1.5 leading-snug">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Standalone containers can be deployed on standard Cloud Run, Vercel, or Netlify instantly.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Block */}
      <section className="py-24 px-6 border-t border-[#2d2f31] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#4285f4]/3 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-3xl mx-auto space-y-6">
          <Database className="w-10 h-10 text-[#8ab4f8] mx-auto animate-pulse" />
          <h2 className="text-3xl sm:text-5xl font-sans tracking-tight font-extrabold text-[#f0f4f9]">Are you ready to explore ZongoBase?</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Provision custom collections, map secure remote developer projects, and trigger serverless code inside isolated environments.
          </p>
          <div className="pt-4">
            <button
              onClick={onGoToConsole}
              id="cta-enroll-now"
              className="bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#131416] font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Go straight to Database Console</span>
              <ArrowRight className="w-4 h-4 text-slate-800 animate-pulse" />
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-[#2d2f31] bg-[#111214] py-12 text-center text-xs text-slate-500 font-mono select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>ZONGOBASE DB CORPORATION © 2026 • LICENSED UNDER STANDALONE COMPILATION REGIMES</div>
          <div className="flex gap-6 text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Privacy Agreement</a>
            <a href="#features" className="hover:text-white transition-colors">Developer SLA</a>
            <a href="#features" className="hover:text-white transition-colors">GitHub Source Core</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
