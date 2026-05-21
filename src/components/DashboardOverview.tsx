import React from 'react';
import { Collection, AuthUser, StorageFile, CloudFunction, ZongoLog, APIKey, DevMessage } from '../types';
import { Database, Users, HardDrive, Cpu, ShieldAlert, Wifi, Terminal, Clock, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  collections: Collection[];
  users: AuthUser[];
  files: StorageFile[];
  functions: CloudFunction[];
  apiKeys: APIKey[];
  logs: ZongoLog[];
  messages: DevMessage[];
  isConnected: boolean;
  onClearLogs: () => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardOverview({
  collections,
  users,
  files,
  functions,
  apiKeys,
  logs,
  messages,
  isConnected,
  onClearLogs,
  setActiveTab
}: Props) {
  const totalDocs = collections.reduce((acc, col) => acc + col.documents.length, 0);
  const totalStorage = files.reduce((acc, f) => acc + f.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warn':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  const stats = [
    {
      label: 'Collections',
      value: collections.length,
      desc: `${totalDocs} total documents`,
      icon: Database,
      color: 'text-cyan-400 border-cyan-500/10 hover:border-cyan-500/30',
      tab: 'database'
    },
    {
      label: 'Authentication Users',
      value: users.length,
      desc: `${users.filter(u => u.status === 'active').length} active records`,
      icon: Users,
      color: 'text-indigo-400 border-indigo-500/10 hover:border-indigo-500/30',
      tab: 'auth'
    },
    {
      label: 'Storage Files',
      value: files.length,
      desc: formatSize(totalStorage),
      icon: HardDrive,
      color: 'text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30',
      tab: 'storage'
    },
    {
      label: 'Cloud Functions',
      value: functions.length,
      desc: `${functions.filter(f => f.status === 'active').length} online agents`,
      icon: Cpu,
      color: 'text-amber-400 border-amber-500/10 hover:border-amber-500/30',
      tab: 'functions'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time sync panel banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-slate-800 bg-[#101726]/50 backdrop-blur-md gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <h1 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
              ZongoBase Console Engine <span className="text-xs font-mono text-amber-500/70 uppercase mt-0.5 tracking-wider font-semibold">v2.1.4</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Connected to client-authoritative reactive SSE channel. Any model mutations made via local endpoints or external calls synchronize in true real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-[10px] text-slate-300 font-mono">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSE Sync: ACTIVE</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-[10px] text-slate-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-[#ff9100]" />
            <span>RTT: ~4ms</span>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            id={`stat-card-${i}`}
            className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/20 hover:bg-[#101726]/75 transition-all duration-300 cursor-pointer select-none"
            onClick={() => setActiveTab(stat.tab)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#ffca28] font-mono font-semibold">{stat.label}</span>
            <div className="mt-4 flex justify-between items-baseline gap-2">
              <div>
                <div className="text-3xl font-sans font-bold text-white">{stat.value}</div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{stat.desc}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-amber-500`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live system monitoring terminal & Credentials summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal logs component */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#101726]/30 overflow-hidden flex flex-col h-[400px]">
          <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">Real-Time Gateway Orchestration Shell</span>
            </div>
            <button
              onClick={onClearLogs}
              className="text-[10px] font-mono hover:text-rose-400 text-slate-400 border border-slate-850 bg-slate-900 px-2.5 py-1 rounded hover:border-rose-500/20 duration-150 transition select-none cursor-pointer"
            >
              Flush Logs
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 font-mono text-[10px] space-y-2.5 bg-[#080b12]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                <Clock className="w-6 h-6 stroke-[1.2] mb-2 animate-pulse text-amber-500/30" />
                <span>No telemetry sequences recorded on this workspace loop.</span>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={`${log.id}-${idx}`} className="flex items-start gap-2 text-slate-300">
                  <span className="text-slate-500 shrink-0 text-[9px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded border ${getLogBadge(log.type)} shrink-0 leading-3`}>
                    {log.type}
                  </span>
                  <span className="text-[#ff9100] uppercase text-[8px] bg-amber-950/40 px-1 py-0.5 rounded border border-amber-900/15 shrink-0 font-bold leading-3">
                    {log.service}
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security / Health panel overview */}
        <div className="rounded-2xl border border-slate-800 bg-[#101726]/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Identity & Security Vault</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every system transaction is filtered through ZongoBase roles. You have configured active gateway keys.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-slate-300">API Gateway Key</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">zb_root_8fa2...</div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded uppercase">ROOT</span>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-slate-300">Public Client Web Key</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">zb_pub_b3a1...</div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded uppercase">PUBLIC</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/40 text-center">
            <button
              onClick={() => setActiveTab('apikeys')}
              className="text-xs font-medium text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 hover:underline select-none cursor-pointer"
            >
              Manage security credentials →
            </button>
          </div>
        </div>
      </div>

      {/* Developer Feedback / Incoming Workspace Messages */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#161719]/90 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded bg-cyan-400 animate-pulse" />
          <span>📩 Received Developer Messages ({messages?.length || 0})</span>
        </h2>
        
        {(!messages || messages.length === 0) ? (
          <div className="py-6 text-center text-xs text-slate-500 font-sans">
            No secure customer messages on workspace queues currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2 relative text-left">
                <span className="absolute top-4 right-4 text-[9px] text-slate-550 font-mono">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
                  <span>From: {msg.senderName}</span>
                  <span className="text-slate-600">|</span>
                  <a href={`mailto:${msg.senderEmail}`} className="text-slate-400 hover:text-cyan-400 underline lowercase font-sans">
                    {msg.senderEmail}
                  </a>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mt-1">
                  Topic: {msg.subject}
                </h4>
                <p className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed font-sans bg-slate-900/30 p-2.5 rounded border border-[#2d2f31]/40">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
