import React, { useState, useEffect } from 'react';
import { Collection, AuthUser, StorageFile, CloudFunction, APIKey, ZongoLog } from './types';
import DashboardOverview from './components/DashboardOverview';
import DatabaseManager from './components/DatabaseManager';
import AuthManager from './components/AuthManager';
import StorageManager from './components/StorageManager';
import FunctionsManager from './components/FunctionsManager';
import ApiKeyManager from './components/ApiKeyManager';
import GatewayExport from './components/GatewayExport';
import { Database, Users, HardDrive, Cpu, KeyRound, Network, Terminal, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [functions, setFunctions] = useState<CloudFunction[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [logs, setLogs] = useState<ZongoLog[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // SSE Real-time Synchronization Setup
  useEffect(() => {
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
        setFiles(payload.files || []);
        setFunctions(payload.functions || []);
        setApiKeys(payload.apiKeys || []);
        setLogs(payload.logs || []);
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

    sse.addEventListener('log', (e: MessageEvent) => {
      const log = JSON.parse(e.data) as ZongoLog;
      setLogs((prev) => [log, ...prev].slice(0, 50));
    });

    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, []);

  // Database actions
  const handleCreateCollection = async (name: string, description: string) => {
    const res = await fetch('/api/zongobase/db/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteCollection = async (name: string) => {
    const res = await fetch(`/api/zongobase/db/collections/${name}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleAddDocument = async (collectionName: string, id: string, data: Record<string, any>) => {
    const res = await fetch(`/api/zongobase/db/collections/${collectionName}/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, data })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleUpdateDocument = async (collectionName: string, id: string, data: Record<string, any>) => {
    const res = await fetch(`/api/zongobase/db/collections/${collectionName}/docs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteDocument = async (collectionName: string, id: string) => {
    const res = await fetch(`/api/zongobase/db/collections/${collectionName}/docs/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleCreateIndex = async (collectionName: string, indexField: string) => {
    const res = await fetch(`/api/zongobase/db/collections/${collectionName}/indexes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indexField })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Auth actions
  const handleAddUser = async (email: string, displayName: string, role: string) => {
    const res = await fetch('/api/zongobase/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleUpdateUserStatus = async (id: string, status: 'active' | 'suspended') => {
    const res = await fetch(`/api/zongobase/auth/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/zongobase/auth/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Storage actions
  const handleUploadFile = async (name: string, path: string, content: string, mimeType: string) => {
    const res = await fetch('/api/zongobase/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path, content, mimeType })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteFile = async (id: string) => {
    const res = await fetch(`/api/zongobase/storage/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Function actions
  const handleCreateFunction = async (name: string, trigger: string, code: string) => {
    const res = await fetch('/api/zongobase/functions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, trigger, code })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleToggleFunction = async (id: string) => {
    const res = await fetch(`/api/zongobase/functions/${id}/toggle`, {
      method: 'PUT'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteFunction = async (id: string) => {
    const res = await fetch(`/api/zongobase/functions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleRunFunction = async (id: string, payload: any) => {
    const res = await fetch(`/api/zongobase/functions/run/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/zongobase/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  const handleDeleteKey = async (id: string) => {
    const res = await fetch(`/api/zongobase/apikeys/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request rejected');
    }
  };

  // Rendering correct component View inside main body
  const renderTabContent = () => {
    switch (activeTab) {
      case 'database':
        return (
          <DatabaseManager
            collections={collections}
            onCreateCollection={handleCreateCollection}
            onDeleteCollection={handleDeleteCollection}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onCreateIndex={handleCreateIndex}
          />
        );
      case 'auth':
        return (
          <AuthManager
            users={users}
            onAddUser={handleAddUser}
            onUpdateUserStatus={handleUpdateUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'storage':
        return (
          <StorageManager
            files={files}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
          />
        );
      case 'functions':
        return (
          <FunctionsManager
            functions={functions}
            onCreateFunction={handleCreateFunction}
            onToggleFunction={handleToggleFunction}
            onDeleteFunction={handleDeleteFunction}
            onRunFunction={handleRunFunction}
          />
        );
      case 'apikeys':
        return (
          <ApiKeyManager
            apiKeys={apiKeys}
            onCreateKey={handleCreateKey}
            onDeleteKey={handleDeleteKey}
          />
        );
      case 'gateway-connect':
        return <GatewayExport />;
      default:
        return (
          <DashboardOverview
            collections={collections}
            users={users}
            files={files}
            functions={functions}
            apiKeys={apiKeys}
            logs={logs}
            isConnected={isConnected}
            onClearLogs={() => setLogs([])}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Control', icon: Terminal },
    { id: 'database', label: 'NoSQL Database', icon: Database },
    { id: 'auth', label: 'Auth Manager', icon: Users },
    { id: 'storage', label: 'Buckets Storage', icon: HardDrive },
    { id: 'functions', label: 'Serverless Cloud', icon: Cpu },
    { id: 'apikeys', label: 'Security Gateway', icon: KeyRound },
    { id: 'gateway-connect', label: 'Export Code / SDKs', icon: Network }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0c101d] text-[#e2e8f0] font-sans overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#060913] border-r border-slate-800/60 flex flex-col justify-between shrink-0">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-8 pb-4">
            <h1 className="text-2xl font-sans tracking-tight font-bold text-white flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#ffca28] to-[#f5820d] shadow-[0_2px_8px_rgba(245,130,13,0.3)]"></div>
              ZONGOBASE
            </h1>
            <p className="text-[10px] text-amber-500/70 tracking-[0.2em] mt-2 font-semibold uppercase">Cloud Data Console</p>
          </div>
          
          <nav className="flex-1 px-4 mt-8 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase tracking-widest px-4 mb-2 font-semibold font-mono">Control</div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-150 text-left select-none cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border-l-2 border-[#f5820d]'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#ff9100]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/20 to-transparent border border-amber-500/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-amber-400 font-medium tracking-tight">Console Sync</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`}></span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2">
              <div className="bg-gradient-to-r from-[#ffca28] to-[#f5820d] h-1 rounded-full w-[100%]"></div>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">
              {isConnected ? 'LIVE SYNCED BACKEND' : 'SYNC DISCONNECTED'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c101d]">
        {/* Header toolbar */}
        <header className="h-20 border-b border-slate-800/60 flex items-center justify-between px-10 bg-[#0c101d]/80 backdrop-blur shrink-0">
          <div>
            <h2 className="text-sm font-medium text-white select-none">
              Console 
              <span className="mx-2 text-slate-600">/</span> 
              <span className="text-[#ffa000] uppercase tracking-wider font-mono text-[11px] bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/10">
                {activeTab.replace('-', ' ')}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 select-all">
              <span className="text-xs font-mono text-slate-400">zongobase-prod-72</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page content */}
        <div className="flex-1 p-10 overflow-y-auto">
          {renderTabContent()}
        </div>

        <footer className="py-5 border-t border-slate-800/40 bg-[#060913]/40 text-center text-[9px] font-mono text-slate-500 shrink-0 select-none">
          ZONGOBASE ENGINE • ALL DATABASES LOCALIZED & MEMORY PERSISTED • COMPATIBLE WITH GITHUB & NETLIFY STANDALONES
        </footer>
      </main>
    </div>
  );
}
