import React, { useState, useEffect } from 'react';
import { Collection, AuthUser, StorageFile, CloudFunction, APIKey, ZongoLog, WebProject, DevMessage } from './types';
import DashboardOverview from './components/DashboardOverview';
import DatabaseManager from './components/DatabaseManager';
import AuthManager from './components/AuthManager';
import StorageManager from './components/StorageManager';
import FunctionsManager from './components/FunctionsManager';
import ApiKeyManager from './components/ApiKeyManager';
import GatewayExport from './components/GatewayExport';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import DeveloperProjects from './components/DeveloperProjects';
import HelpWizard from './components/HelpWizard';
import { Database, Users, HardDrive, Cpu, KeyRound, Network, Terminal, Settings, Globe, LogOut, Sparkles, ArrowLeft, ArrowRight, Home, ChevronRight, HelpCircle, Compass, BookOpen } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('zongobase_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Real-time Navigation History Stack
  const [history, setHistory] = useState<string[]>(['dashboard']);
  const [historyPointer, setHistoryPointer] = useState<number>(0);
  const [viewLanding, setViewLanding] = useState<boolean>(false);

  const navigateTab = (tab: string, bypassPush: boolean = false) => {
    setActiveTab(tab);
    if (bypassPush) return;
    
    // Truncate forward history if we were in a backward state and clicked a fresh tab
    const updatedHistory = history.slice(0, historyPointer + 1);
    const newHistory = [...updatedHistory, tab].slice(-20); // Maintain a buffer of 20 positions
    setHistory(newHistory);
    setHistoryPointer(newHistory.length - 1);
  };

  const handleGoBack = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      setHistoryPointer(prevPointer);
      setActiveTab(history[prevPointer]);
    }
  };

  const handleGoForward = () => {
    if (historyPointer < history.length - 1) {
      const nextPointer = historyPointer + 1;
      setHistoryPointer(nextPointer);
      setActiveTab(history[nextPointer]);
    }
  };
  const [collections, setCollections] = useState<Collection[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [projects, setProjects] = useState<WebProject[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [functions, setFunctions] = useState<CloudFunction[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [logs, setLogs] = useState<ZongoLog[]>([]);
  const [messages, setMessages] = useState<DevMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // SSE Real-time Synchronization Setup
  useEffect(() => {
    if (!currentUser) return;

    let sse: EventSource | null = new EventSource('/api/zongobase/db/sync');

    sse.onopen = () => {
      setIsConnected(true);
    };

    sse.onerror = () => {
      setIsConnected(false);
    };

    // Initial state trigger
    sse.addEventListener('init', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setCollections(payload.collections || []);
        setUsers(payload.users || []);
        setProjects(payload.projects || []);
        setFiles(payload.files || []);
        setFunctions(payload.functions || []);
        setApiKeys(payload.apiKeys || []);
        setLogs(payload.logs || []);
        setMessages(payload.messages || []);
      } catch (err) {
        console.error('Failed processing initial database pool metadata:', err);
      }
    });

    sse.addEventListener('collections:updated', (e: MessageEvent) => {
      setCollections(JSON.parse(e.data));
    });

    sse.addEventListener('users:updated', (e: MessageEvent) => {
      setUsers(JSON.parse(e.data));
    });

    sse.addEventListener('files:updated', (e: MessageEvent) => {
      setFiles(JSON.parse(e.data));
    });

    sse.addEventListener('functions:updated', (e: MessageEvent) => {
      setFunctions(JSON.parse(e.data));
    });

    sse.addEventListener('apikeys:updated', (e: MessageEvent) => {
      setApiKeys(JSON.parse(e.data));
    });

    sse.addEventListener('messages:updated', (e: MessageEvent) => {
      setMessages(JSON.parse(e.data));
    });

    sse.addEventListener('log', (e: MessageEvent) => {
      const log = JSON.parse(e.data) as ZongoLog;
      setLogs((prev) => [log, ...prev].slice(0, 50));
    });

    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [currentUser]);

  // Synchronized authenticated fetch builder
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'x-zongobase-user-id': currentUser ? currentUser.id : '',
      'Authorization': currentUser ? `Bearer ${currentUser.id}` : ''
    };
    return fetch(url, { ...options, headers });
  };

  // Database actions
  const handleCreateCollection = async (name: string, description: string) => {
    const res = await fetchWithAuth('/api/zongobase/db/collections', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteCollection = async (name: string) => {
    const res = await fetchWithAuth(`/api/zongobase/db/collections/${name}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleAddDocument = async (collectionName: string, id: string, data: Record<string, any>) => {
    const res = await fetchWithAuth(`/api/zongobase/db/collections/${collectionName}/docs`, {
      method: 'POST',
      body: JSON.stringify({ id, data })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleUpdateDocument = async (collectionName: string, id: string, data: Record<string, any>) => {
    const res = await fetchWithAuth(`/api/zongobase/db/collections/${collectionName}/docs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteDocument = async (collectionName: string, id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/db/collections/${collectionName}/docs/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleCreateIndex = async (collectionName: string, indexField: string) => {
    const res = await fetchWithAuth(`/api/zongobase/db/collections/${collectionName}/indexes`, {
      method: 'POST',
      body: JSON.stringify({ indexField })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Auth actions
  const handleAddUser = async (email: string, displayName: string, role: string) => {
    const res = await fetchWithAuth('/api/zongobase/auth/users', {
      method: 'POST',
      body: JSON.stringify({ email, displayName, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleUpdateUserStatus = async (id: string, status: 'active' | 'suspended') => {
    const res = await fetchWithAuth(`/api/zongobase/auth/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/auth/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Project Management Actions (For Regular Developers)
  const handleCreateProject = async (name: string, domainUrl: string, description: string) => {
    const res = await fetchWithAuth('/api/zongobase/projects', {
      method: 'POST',
      body: JSON.stringify({ name, domainUrl, description })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed constructing project link.');
    }
    const newProj = await res.json();
    setProjects(prev => [...prev, newProj]);
  };

  const handleDeleteProject = async (id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/projects/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed dismantling project link.');
    }
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Storage actions
  const handleUploadFile = async (name: string, path: string, content: string, mimeType: string) => {
    const res = await fetchWithAuth('/api/zongobase/storage', {
      method: 'POST',
      body: JSON.stringify({ name, path, content, mimeType })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteFile = async (id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/storage/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Function actions
  const handleCreateFunction = async (name: string, trigger: string, code: string) => {
    const res = await fetchWithAuth('/api/zongobase/functions', {
      method: 'POST',
      body: JSON.stringify({ name, trigger, code })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleToggleFunction = async (id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/functions/${id}/toggle`, {
      method: 'PUT'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteFunction = async (id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/functions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleRunFunction = async (id: string, payload: any) => {
    const res = await fetchWithAuth(`/api/zongobase/functions/run/${id}`, {
      method: 'POST',
      body: JSON.stringify({ payload })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Runtime disengaged');
    }
    return res.json();
  };

  // Api key actions
  const handleCreateKey = async (name: string, role: string) => {
    const res = await fetchWithAuth('/api/zongobase/apikeys', {
      method: 'POST',
      body: JSON.stringify({ name, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteKey = async (id: string) => {
    const res = await fetchWithAuth(`/api/zongobase/apikeys/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zongobase_user');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Scoped views calculation based on user roles
  const isAdmin = currentUser?.role === 'admin';
  
  const displayedCollections = isAdmin 
    ? collections 
    : collections.filter(c => c.ownerId === currentUser?.id);

  const displayedUsers = isAdmin ? users : [];
  
  const displayedProjects = isAdmin 
    ? projects 
    : projects.filter(p => p.ownerId === currentUser?.id);

  const displayedFiles = isAdmin 
    ? files 
    : files.filter(f => !f.id.startsWith("admin")); // Allow filtering generic files

  const displayedFunctions = isAdmin ? functions : [];
  const displayedApiKeys = isAdmin ? apiKeys : [];

  // If the user manually toggles the Welcome portal website or has no active session, show the dynamic LandingPage
  if (viewLanding || !currentUser) {
    if (showLogin) {
      return (
        <LoginPage 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('zongobase_user', JSON.stringify(user));
            setShowLogin(false);
            setViewLanding(false);
          }}
          onBackToHome={() => {
            setShowLogin(false);
            setViewLanding(true);
          }}
        />
      );
    }
    return (
      <LandingPage 
        onGoToConsole={() => {
          if (currentUser) {
            setViewLanding(false);
          } else {
            setShowLogin(true);
          }
        }} 
      />
    );
  }

  // Rendering correct component View inside main body
  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <DeveloperProjects
            projects={displayedProjects}
            collections={displayedCollections}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'database':
        return (
          <DatabaseManager
            collections={displayedCollections}
            onCreateCollection={handleCreateCollection}
            onDeleteCollection={handleDeleteCollection}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onCreateIndex={handleCreateIndex}
          />
        );
      case 'auth':
        if (!isAdmin) return null;
        return (
          <AuthManager
            users={displayedUsers}
            onAddUser={handleAddUser}
            onUpdateUserStatus={handleUpdateUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'storage':
        return (
          <StorageManager
            files={displayedFiles}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
          />
        );
      case 'functions':
        if (!isAdmin) return null;
        return (
          <FunctionsManager
            functions={displayedFunctions}
            onCreateFunction={handleCreateFunction}
            onToggleFunction={handleToggleFunction}
            onDeleteFunction={handleDeleteFunction}
            onRunFunction={handleRunFunction}
          />
        );
      case 'apikeys':
        if (!isAdmin) return null;
        return (
          <ApiKeyManager
            apiKeys={displayedApiKeys}
            onCreateKey={handleCreateKey}
            onDeleteKey={handleDeleteKey}
          />
        );
      case 'gateway-connect':
        return <GatewayExport />;
      case 'help-wizard':
        return <HelpWizard />;
      default:
        return (
          <DashboardOverview
            collections={displayedCollections}
            users={displayedUsers}
            files={displayedFiles}
            functions={displayedFunctions}
            apiKeys={displayedApiKeys}
            logs={logs}
            messages={messages}
            isConnected={isConnected}
            onClearLogs={() => setLogs([])}
            setActiveTab={navigateTab}
          />
        );
    }
  };

  const navItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Dashboard Control', icon: Terminal },
        { id: 'database', label: 'NoSQL Database', icon: Database },
        { id: 'auth', label: 'Auth Manager', icon: Users },
        { id: 'storage', label: 'Buckets Storage', icon: HardDrive },
        { id: 'functions', label: 'Serverless Cloud', icon: Cpu },
        { id: 'apikeys', label: 'Security Gateway', icon: KeyRound },
        { id: 'gateway-connect', label: 'Export Code / SDKs', icon: Network },
        { id: 'help-wizard', label: 'Setup Wizard & FAQs', icon: HelpCircle }
      ]
    : [
        { id: 'dashboard', label: 'Console Overview', icon: Terminal },
        { id: 'projects', label: 'Web Projects Linker', icon: Globe },
        { id: 'database', label: 'My NoSQL Database', icon: Database },
        { id: 'storage', label: 'Virtual Storage', icon: HardDrive },
        { id: 'gateway-connect', label: 'Export Code / SDKs', icon: Network },
        { id: 'help-wizard', label: 'Setup Wizard & FAQs', icon: HelpCircle }
      ];

  return (
    <div className="flex h-screen w-screen bg-[#131416] text-[#f0f4f9] font-sans overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#131416] border-r border-[#2d2f31]/80 flex flex-col justify-between shrink-0">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-8 pb-4">
            <h1 className="text-xl font-sans tracking-tight font-extrabold text-white flex items-center gap-2 cursor-pointer select-none" onClick={() => navigateTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-[#1e1f20] border border-amber-500/30 flex items-center justify-center relative font-mono text-xs text-amber-500 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                ZB
              </div>
              <span>Zongo<span className="bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#e040fb] bg-clip-text text-transparent">Base</span></span>
            </h1>
            <p className="text-[9px] text-[#8ab4f8] tracking-[0.2em] mt-2 font-bold uppercase">Cloud Data Console</p>
          </div>
          
          <nav className="flex-1 px-4 mt-8 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2 font-semibold font-mono">Control</div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150 text-left select-none cursor-pointer ${
                    isActive
                      ? 'bg-[#4285f4]/10 text-[#8ab4f8] border-l-2 border-[#1a73e8]'
                      : 'text-slate-400 hover:bg-[#1e1f20] hover:text-[#f0f4f9]'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#8ab4f8]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Circular Return to Welcome Homepage link */}
            <div className="text-[10px] text-slate-500 uppercase tracking-widest px-4 pt-6 mb-2 font-semibold font-mono border-t border-[#2d2f31]/40">Sovereign Portal</div>
            <button
              onClick={() => setViewLanding(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150 text-left select-none cursor-pointer text-slate-400 hover:bg-[#1e1f20] hover:text-[#f0f4f9]"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Welcome Homepage</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="p-4 rounded-xl bg-[#1e1f20] border border-[#2d2f31]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#8ab4f8] font-medium tracking-tight">Console Sync</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`}></span>
            </div>
            <div className="w-full bg-[#131416] h-1 rounded-full mt-2">
              <div className="bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#e040fb] h-1 rounded-full w-[100%]"></div>
            </div>
            <p className="text-[9px] text-[#8ab4f8] mt-2 font-mono uppercase font-bold tracking-wider">
              {isConnected ? 'LIVE SYNCED BACKEND' : 'SYNC DISCONNECTED'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#131416]">
        {/* Header toolbar */}
        <header className="h-20 border-b border-[#2d2f31]/80 flex items-center justify-between px-10 bg-[#131416]/80 backdrop-blur shrink-0 gap-4">
          <div className="flex items-center gap-4">
            {/* Real-time Dynamic History Back/Forward */}
            <div className="flex items-center gap-1.5 bg-[#1b1c1e] p-1 rounded-lg border border-[#2d2f31]">
              <button
                onClick={handleGoBack}
                disabled={historyPointer <= 0}
                className="p-1 px-2 rounded hover:bg-[#1e1f20] text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent duration-150 transition select-none cursor-pointer"
                title="Go Back (Backward Page History)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleGoForward}
                disabled={historyPointer >= history.length - 1}
                className="p-1 px-2 rounded hover:bg-[#1e1f20] text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent duration-150 transition select-none cursor-pointer"
                title="Go Forward (Forward Page History)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Path Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans select-none">
              <button 
                onClick={() => navigateTab('dashboard')}
                className="hover:text-amber-400 hover:underline duration-150 transition font-bold"
              >
                ZongoBase
              </button>
              <ChevronRight className="w-3 h-3 text-slate-600 animate-pulse" />
              <button 
                onClick={() => navigateTab(activeTab)}
                className="text-[#8ab4f8] uppercase tracking-wider font-mono text-[9px] bg-[#4285f4]/5 px-2.5 py-1 rounded-md border border-[#4285f4]/15 hover:border-[#8ab4f8]/30 font-bold transition-all text-left"
              >
                {activeTab.replace('-', ' ')}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1e1f20] px-3.5 py-1.5 rounded-full border border-[#2d2f31]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-xs font-mono text-[#f0f4f9] font-semibold truncate max-w-[150px]">
                {currentUser.displayName} ({currentUser.role === 'admin' ? 'Root Admin' : 'Developer'})
              </span>
            </div>

            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 py-1.5 px-3 rounded-lg border border-[#2d2f31] hover:border-red-500/30 text-slate-400 hover:text-red-400 bg-[#1e1f20]/60 hover:bg-red-500/10 cursor-pointer transition-all flex items-center gap-2 text-xs font-semibold"
              title="Disconnect session console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page content */}
        <div className="flex-1 p-10 overflow-y-auto">
          {renderTabContent()}
        </div>

        <footer className="py-4 border-t border-[#2d2f31]/60 bg-[#1e1f20]/20 text-center text-[9px] font-mono text-slate-500 shrink-0 select-none uppercase tracking-wider font-bold">
          ZONGOBASE ENGINE • ALL DATABASES LOCALIZED & MEMORY PERSISTED • COMPATIBLE WITH GITHUB & NETLIFY STANDALONES
        </footer>
      </main>
    </div>
  );
}
