import React, { useState } from "react";
import { WebProject, Collection } from "../types";
import { Plus, Trash2, Globe, Key, Copy, Check, Play, Terminal, HelpCircle, Code2, Database, AlertCircle, RefreshCw, Send, CheckCircle2, Zap, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getApiUrl, getBackendOrigin } from "../utils/api";

interface DeveloperProjectsProps {
  projects: WebProject[];
  collections: Collection[];
  onCreateProject: (name: string, domainUrl: string, description: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onUpdateProject: (
    id: string,
    name: string,
    domainUrl: string,
    description: string,
    authEmailPasswordEnabled?: boolean,
    authAllowRegistration?: boolean,
    minPasswordLength?: number,
    authRequireConfirm?: boolean
  ) => Promise<void>;
}

export default function DeveloperProjects({
  projects,
  collections,
  onCreateProject,
  onDeleteProject,
  onUpdateProject,
}: DeveloperProjectsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [domainUrl, setDomainUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState<WebProject | null>(null);
  
  // For Editing Project
  const [editingProject, setEditingProject] = useState<WebProject | null>(null);
  const [editName, setEditName] = useState("");
  const [editDomainUrl, setEditDomainUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAuthEmailPasswordEnabled, setEditAuthEmailPasswordEnabled] = useState(true);
  const [editAuthAllowRegistration, setEditAuthAllowRegistration] = useState(true);
  const [editMinPasswordLength, setEditMinPasswordLength] = useState(6);
  const [editAuthRequireConfirm, setEditAuthRequireConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const startEditing = (proj: WebProject) => {
    setEditingProject(proj);
    setEditName(proj.name);
    setEditDomainUrl(proj.domainUrl);
    setEditDescription(proj.description || "");
    setEditAuthEmailPasswordEnabled(proj.authEmailPasswordEnabled !== false);
    setEditAuthAllowRegistration(proj.authAllowRegistration !== false);
    setEditMinPasswordLength(proj.minPasswordLength || 6);
    setEditAuthRequireConfirm(!!proj.authRequireConfirm);
    setEditError("");
  };

  const handleUpdateProjectConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setIsEditing(true);
    try {
      if (!editingProject) return;
      await onUpdateProject(
        editingProject.id,
        editName,
        editDomainUrl,
        editDescription,
        editAuthEmailPasswordEnabled,
        editAuthAllowRegistration,
        editMinPasswordLength,
        editAuthRequireConfirm
      );
      // Synchronize currently active/selected project with the new parameters
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject({
          ...selectedProject,
          name: editName,
          domainUrl: editDomainUrl,
          description: editDescription,
          authEmailPasswordEnabled: editAuthEmailPasswordEnabled,
          authAllowRegistration: editAuthAllowRegistration,
          minPasswordLength: editMinPasswordLength,
          authRequireConfirm: editAuthRequireConfirm
        });
      }
      setEditingProject(null);
    } catch (err: any) {
      setEditError(err.message || "Failed updating project configurations.");
    } finally {
      setIsEditing(false);
    }
  };
  
  // Copy state mapping
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground Sandbox State
  const [targetCol, setTargetCol] = useState("leads_db");
  const [sandboxPayload, setSandboxPayload] = useState(
    JSON.stringify({ name: "Brice Williams", company: "ZongoTech Corp", query: "Can I host standard SPAs?", budget: 4500 }, null, 2)
  );
  const [sandboxMethod, setSandboxMethod] = useState<"GET" | "POST">("POST");
  const [sandboxLogs, setSandboxLogs] = useState<any[]>([]);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  // For Adding Project
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegisterProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await onCreateProject(projectName, domainUrl, description);
      setProjectName("");
      setDomainUrl("");
      setDescription("");
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to catalog project alignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runSandboxSimulate = async () => {
    if (!selectedProject) {
      alert("Please select a project mapping first to retrieve valid API key bindings.");
      return;
    }
    
    setIsSandboxRunning(true);
    const apiRoute = sandboxMethod === "GET" 
      ? "/api/zongobase/db" 
      : `/api/zongobase/db/collections/${targetCol.trim().toLowerCase()}/docs`;

    const requestDetails = {
      Timestamp: new Date().toLocaleTimeString(),
      URL: getApiUrl(apiRoute),
      Headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${selectedProject.apiKey}`
      },
      Payload: sandboxMethod === "POST" ? JSON.parse(sandboxPayload) : undefined
    };

    const newLogEntry: any = {
      method: sandboxMethod,
      timestamp: new Date().toLocaleTimeString(),
      url: getApiUrl(apiRoute),
      request: requestDetails,
      status: "pending"
    };

    try {
      const fetchOpts: RequestInit = {
        method: sandboxMethod,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${selectedProject.apiKey}`
        }
      };

      if (sandboxMethod === "POST") {
        fetchOpts.body = sandboxPayload;
      }

      const res = await fetch(getApiUrl(apiRoute), fetchOpts);
      const data = await res.json();

      newLogEntry.status = res.status;
      newLogEntry.response = data;
    } catch (err: any) {
      newLogEntry.status = "Network Exception";
      newLogEntry.response = { error: err.message || "Connection disengaged" };
    } finally {
      setSandboxLogs(prev => [newLogEntry, ...prev]);
      setIsSandboxRunning(false);
    }
  };

  const activeProj = selectedProject || (projects.length > 0 ? projects[0] : null);

  return (
    <div className="space-y-8 select-none">
      {/* Overview Greeting Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">My Remote Web Projects</h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Connect external frontend environments (GitHub static sites, Netlify, Vercel apps, or mobile clients) immediately. ZongoBase isolates data safely so databases are queryable from anywhere across the globe.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button
              id="btn-register-project"
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-500 font-medium px-4 py-2 rounded-xl text-xs text-white flex items-center gap-2 border border-indigo-500/30 shadow-lg cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link New Web Project</span>
            </button>
            <div className="text-xs text-slate-500 font-mono">
              ACTIVE LINKS: <span className="text-indigo-400 font-semibold">{projects.length} CATALOGED</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-[#1b1a30] to-[#12111f] border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-indigo-500/10 blur-xl rounded-full pointer-events-none" />
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 font-mono uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit mb-3">
              <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>Developer Edge Advantage</span>
            </div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <span>Zero-Config secure proxy Setup</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Mainstream platforms require huge libraries and complex setup. Beat the competition instantly by linking any app node using our <strong>1-Line Secure Link Command</strong>. Secure your key behind a zero-cost edge proxy.
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800/60 font-mono text-[10px] space-y-2">
            <div className="text-slate-500 uppercase font-bold tracking-wider text-[9px]">Run in your project directory:</div>
            <div className="flex bg-slate-950 border border-slate-900 rounded-lg p-2 items-center justify-between font-mono text-indigo-400 select-all leading-none">
              <span>npx zongobase link --key={activeProj?.apiKey.substring(0, 10) || "zb_key"}...</span>
              <button
                onClick={() => copyToClipboard(`npx zongobase link --key=${activeProj?.apiKey || "YOUR_PROJECT_ACCESS_KEY"}`, "clinpx")}
                className="p-1 hover:text-white text-slate-500 group transition-all"
                title="Copy 1-Line CLI setup command"
              >
                {copiedKey === "clinpx" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 group-hover:scale-105" />
                )}
              </button>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              🛡️ Generates a type-safe database mapping structure locally under 1 sec.
            </p>
          </div>
        </div>
      </div>

      {/* Add Project Form Drawer Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#10141f] border border-slate-800 p-6 rounded-2xl max-w-xl relative shadow-2xl"
          >
            <h4 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Link New Remote Webspace Project</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Submit your app metadata to generate isolated credentials mapping. This creates standard public/write endpoints.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs flex gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">PROJECT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brandon Fitness Tracker"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">FRONTEND DEPLOY DOMAIN URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://fitness.netlify.app"
                    value={domainUrl}
                    onChange={(e) => setDomainUrl(e.target.value)}
                    className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1">OPTIONAL ARCHITECTURE DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="e.g. NextJS web dashboard tracking consumer activity logs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setErrorMsg(""); }}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 font-medium px-4 py-2 rounded-lg text-xs text-white disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? "Linking..." : "Register Project Node"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {editingProject && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#10141f] border border-slate-800 p-6 rounded-2xl max-w-xl relative shadow-2xl"
          >
            <h4 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>Configure Linked Web Project</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Update credentials mapping, metadata, and domain constraints for this project node.
            </p>

            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs flex gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProjectConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">PROJECT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brandon Fitness Tracker"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">FRONTEND DEPLOY DOMAIN URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://fitness.netlify.app"
                    value={editDomainUrl}
                    onChange={(e) => setEditDomainUrl(e.target.value)}
                    className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1">OPTIONAL ARCHITECTURE DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="e.g. NextJS web dashboard tracking consumer activity logs"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-4">
                <div className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider">PROJECT AUTHENTICATION (mBaaS CONFIGURATION)</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[#131722]/50 border border-slate-800/80 rounded-xl">
                    <div>
                      <div className="text-xs font-medium text-white">Email & Password Auth</div>
                      <div className="text-[10px] text-slate-400">Enable user sign-in via credentials</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editAuthEmailPasswordEnabled}
                        onChange={(e) => setEditAuthEmailPasswordEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#131722]/50 border border-slate-800/80 rounded-xl">
                    <div>
                      <div className="text-xs font-medium text-white">Self-Registration</div>
                      <div className="text-[10px] text-slate-400">Allow users to sign-up themselves</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editAuthAllowRegistration}
                        disabled={!editAuthEmailPasswordEnabled}
                        onChange={(e) => setEditAuthAllowRegistration(e.target.checked)}
                        className="sr-only peer disabled:opacity-50"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">MINIMUM PASSWORD LENGTH</label>
                    <input
                      type="number"
                      min={4}
                      max={32}
                      disabled={!editAuthEmailPasswordEnabled}
                      value={editMinPasswordLength}
                      onChange={(e) => setEditMinPasswordLength(Number(e.target.value))}
                      className="w-full bg-[#161a25]/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#131722]/50 border border-slate-800/80 rounded-xl">
                    <div>
                      <div className="text-xs font-medium text-white">Require Email OTP</div>
                      <div className="text-[10px] text-slate-400">Validate emails using verification code</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editAuthRequireConfirm}
                        disabled={!editAuthEmailPasswordEnabled}
                        onChange={(e) => setEditAuthRequireConfirm(e.target.checked)}
                        className="sr-only peer disabled:opacity-50"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setEditingProject(null); setEditError(""); }}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="bg-indigo-600 hover:bg-indigo-500 font-medium px-4 py-2 rounded-lg text-xs text-white disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {isEditing ? "Updating..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Left Catalog, Right Selected Connections SDK guide */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Projects List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold px-1">linked Projects Catalog ({projects.length})</div>
          
          {projects.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center">
              <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No external web applications registered yet.</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-xs text-indigo-400 font-semibold mt-2 hover:underline cursor-pointer"
              >
                Add first project
              </button>
            </div>
          ) : (
            projects.map((proj) => {
              const isActive = activeProj?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${isActive ? 'bg-slate-800/40 border-indigo-500/40' : 'bg-slate-900/20 border-slate-800 hover:bg-slate-800/20'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="truncate pr-4">
                      <div className="flex items-center gap-2">
                        <Globe className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <h4 className="text-xs font-semibold text-white truncate">{proj.name}</h4>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 w-full truncate">{proj.domainUrl || "Custom Client Hub"}</div>
                    </div>
                    <div className="flex gap-1 items-center self-start shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(proj);
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                        title="Configure project settings"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to dismantle project ${proj.name}?`)) {
                            onDeleteProject(proj.id);
                            if (selectedProject?.id === proj.id) setSelectedProject(null);
                          }
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete project link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-3">
                    <span className="text-[9px] text-slate-500 font-mono uppercase">TOKEN ID GENERATED</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-semibold">{proj.apiKey.substring(0, 15)}...</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Selected Details, API endpoints, SDK, and Sandbox simulation */}
        <div className="lg:col-span-3 space-y-6">
          {activeProj ? (
            <>
              {/* Credentials & Copy segment */}
              <div id="project-details" className="bg-[#10141f] border border-slate-800/80 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono uppercase">PROJECT RESOLVED</span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{activeProj.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeProj.description || "No description cataloged for project node."}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">ENDPOINT DB GATEWAY</label>
                    <div className="flex bg-[#161a25] border border-slate-800 rounded-lg items-center px-2.5 py-1.5 select-all">
                      <span className="text-slate-400 text-xs font-mono truncate mr-2">{window.location.origin}/api/zongobase/db</span>
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}/api/zongobase/db`, "dburl")}
                        className="p-1 text-slate-500 hover:text-white shrink-0 ml-auto"
                      >
                        {copiedKey === "dburl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">CLIENT ACCESS KEY (AUTH_BEARER)</label>
                    <div className="flex bg-[#161a25] border border-slate-800 rounded-lg items-center px-2.5 py-1.5 select-all">
                      <Key className="w-3 h-3 text-amber-500 shrink-0 mr-1.5" />
                      <span className="text-amber-400 text-xs font-mono truncate mr-2">{activeProj.apiKey}</span>
                      <button 
                        onClick={() => copyToClipboard(activeProj.apiKey, "apikey")}
                        className="p-1 text-slate-500 hover:text-white shrink-0 ml-auto"
                      >
                        {copiedKey === "apikey" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Client Authentication configuration summary */}
              <div className="bg-[#10141f] border border-slate-800/80 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xs font-mono uppercase text-white font-semibold flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Project Authentication Settings</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Status controls mapped to client-side login and registration endpoints.</p>
                  </div>
                  <button
                    onClick={() => startEditing(activeProj)}
                    className="p-1 px-3 text-[10px] font-mono font-semibold rounded-lg text-indigo-400 hover:text-white bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-600 hover:border-indigo-500 transition-all cursor-pointer shrink-0"
                  >
                    Configure Auth
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-800/60 pt-4">
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">EMAIL / PASSWORD</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeProj.authEmailPasswordEnabled !== false ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      <span className="text-xs font-semibold text-white">
                        {activeProj.authEmailPasswordEnabled !== false ? "ACTIVE" : "DISABLED"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">SELF REGISTER</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeProj.authAllowRegistration !== false ? "bg-emerald-500" : "bg-orange-500"}`}></span>
                      <span className="text-xs font-semibold text-white font-mono">
                        {activeProj.authAllowRegistration !== false ? "ALLOWED" : "INVITE ONLY"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">PASSWORD REQS</div>
                    <div className="text-xs font-semibold text-white mt-1">
                      Min {activeProj.minPasswordLength || 6} Char
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40">
                    <div className="text-[9px] font-mono text-slate-500 uppercase">EMAIL OTP CONFIRM</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeProj.authRequireConfirm ? "bg-cyan-500" : "bg-slate-500"}`}></span>
                      <span className="text-xs font-semibold text-white">
                        {activeProj.authRequireConfirm ? "REQUIRED" : "IMMEDIATE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Live Connection SDK Box */}
              <div className="bg-[#10141f] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono uppercase text-white font-semibold">Integrate Web App Anywhere</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">cURL / JavaScript / NodeJS</span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Send real HTTP API requests from any client-side codebase to manage collections. Copy this JavaScript template into your remote projects file:
                  </p>
                  <div className="relative">
                    <pre className="bg-[#0c0f16] p-4 rounded-xl text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto border border-slate-900 shadow-inner">
{`// 1. Save data from any website in the world
async function insertItem(collection, documentId, payload) {
  const response = await fetch(\`\${"${getBackendOrigin()}"}/api/zongobase/db/collections/\${collection}/docs\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${activeProj.apiKey}"
    },
    body: JSON.stringify({
      id: documentId,
      data: payload
    })
  });
  return response.json();
}

// 2. Fetch all collections restricted to your projects
async function getCollections() {
  const res = await fetch(\`\${"${getBackendOrigin()}"}/api/zongobase/db\`, {
    headers: { "Authorization": "Bearer ${activeProj.apiKey}" }
  });
  return res.json();
}`}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(`async function insertItem(collection, documentId, payload) {
  const response = await fetch(\`${getBackendOrigin()}/api/zongobase/db/collections/\${collection}/docs\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${activeProj.apiKey}"
    },
    body: JSON.stringify({
      id: documentId,
      data: payload
    })
  });
  return response.json();
}`, "sdkcode")}
                      className="absolute right-3 top-3 p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      {copiedKey === "sdkcode" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive SDK Sandbox Playground */}
              <div className="bg-[#10141f] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 bg-[#141926] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase text-white font-semibold">Interactive Sandbox Gateway Tester</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono">LIVE API HOOKS</span>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Trigger a simulated external HTTP database transaction request from inside this browser tab to verify that global queries compile and store accurately.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">HTTP METHOD</label>
                      <select
                        value={sandboxMethod}
                        onChange={(e) => setSandboxMethod(e.target.value as "GET" | "POST")}
                        className="w-full bg-[#161a25] border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      >
                        <option value="POST">POST (Insert/Write Doc)</option>
                        <option value="GET">GET (Query Collections)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">TARGET COLLECTION</label>
                      <input
                        type="text"
                        required
                        disabled={sandboxMethod === "GET"}
                        placeholder="e.g. leads_db"
                        value={targetCol}
                        onChange={(e) => setTargetCol(e.target.value)}
                        className="w-full bg-[#161a25] border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {sandboxMethod === "POST" && (
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">JSON INJECTION PAYLOAD</label>
                      <textarea
                        rows={4}
                        value={sandboxPayload}
                        onChange={(e) => setSandboxPayload(e.target.value)}
                        className="w-full bg-[#0c0f16] border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={isSandboxRunning}
                      onClick={runSandboxSimulate}
                      className="bg-emerald-600 hover:bg-emerald-500 font-medium px-5 py-2.5 rounded-lg text-xs text-white flex items-center gap-2 shadow-lg hover:shadow-emerald-900/20 shadow-emerald-950/40 border border-emerald-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isSandboxRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Routing Over Air...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit API Request</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Log Console Output terminal */}
                  {sandboxLogs.length > 0 && (
                    <div className="border-t border-slate-800/65 pt-4 space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-mono text-slate-500">SANDBOX TERMINAL LOG TRANSACTION HISTORIES</span>
                        <button 
                          onClick={() => setSandboxLogs([])}
                          className="text-[9px] font-mono text-indigo-400 hover:underline"
                        >
                          Clear Terminal
                        </button>
                      </div>
                      <div className="space-y-3.5 max-h-64 overflow-y-auto font-mono text-[10px]">
                        {sandboxLogs.map((log, idx) => (
                          <div key={idx} className="bg-[#0c0f16] border border-slate-900 p-3 rounded-lg space-y-2">
                            <div className="flex justify-between items-center text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                  {log.method}
                                </span>
                                <span>{log.url}</span>
                              </div>
                              <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[9px]">
                              <div>
                                <span className="text-slate-500 block mb-1">HEADER ATTACHMENTS</span>
                                <pre className="bg-[#141926]/40 p-2 rounded text-slate-400 overflow-x-auto">
{JSON.stringify(log.request.Headers, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="text-slate-500 block mb-1">GATEWAY RESPONSE (STATUS: {log.status})</span>
                                <pre className={`p-2 rounded overflow-x-auto ${log.status >= 200 && log.status < 300 ? 'bg-emerald-950/20 text-emerald-300' : 'bg-red-950/20 text-red-300'}`}>
{JSON.stringify(log.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center">
              <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-md font-semibold text-white">No active web projects</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Add or select a project mapping on the left side to review credentials, query pathways, sandbox integrations, and dynamic code templates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
