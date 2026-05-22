import React, { useState } from 'react';
import { AuthUser } from '../types';
import { Users, Plus, ShieldCheck, Mail, Ban, CheckCircle, Trash2, Search, HelpCircle } from 'lucide-react';

interface Props {
  users: AuthUser[];
  onAddUser: (email: string, displayName: string, role: 'admin' | 'user' | 'anonymous') => Promise<void>;
  onUpdateUserStatus: (id: string, status: 'active' | 'suspended') => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function AuthManager({
  users,
  onAddUser,
  onUpdateUserStatus,
  onDeleteUser
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user' | 'anonymous'>('user');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newEmail || !newDisplayName) return;
    try {
      await onAddUser(newEmail, newDisplayName, newRole);
      setNewEmail('');
      setNewDisplayName('');
      setNewRole('user');
      setIsAddingUser(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user sequence.');
    }
  };

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(q) ||
      user.displayName.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Auth overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-slate-800 bg-slate-950/20 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>ZongoBase Auth Manager Services</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-2xl">
            Control application-level security, track historic sign-ins, and provision development tokens for secure JWT validations.
          </p>
        </div>
        <button
          onClick={() => setIsAddingUser(!isAddingUser)}
          className="px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register test user</span>
        </button>
      </div>

      {isAddingUser && (
        <form onSubmit={handleCreateUser} className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 space-y-4 max-w-2xl">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-300">Identity Account Registry</h4>
            <button type="button" onClick={() => setIsAddingUser(false)} className="text-[10px] font-mono text-slate-500">Close</button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/15 text-rose-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="e.g., brandon@zongobase.tech"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400">Display Name</label>
              <input
                type="text"
                placeholder="e.g., Brandon Stone"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 p-2.5 rounded text-white focus:outline-none font-sans"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-slate-400">Assigned Privilege Role</label>
            <div className="flex gap-4">
              {['admin', 'user', 'anonymous'].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 capitalize font-mono">
                  <input
                    type="radio"
                    name="privilege_role"
                    value={r}
                    checked={newRole === r}
                    onChange={() => setNewRole(r as any)}
                    className="accent-indigo-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="text-xs font-mono text-slate-500 px-3 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-mono bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-1.5 rounded"
            >
              Register Account
            </button>
          </div>
        </form>
      )}

      {/* Accounts List and Search */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl w-full sm:max-w-sm gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Email, Display name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-300 w-full focus:outline-none"
            />
          </div>
          <span className="text-[10px] text-indigo-400 uppercase font-mono bg-indigo-500/5 px-2.5 py-1 border border-indigo-500/10 rounded-full">
            Local user pool directory
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <HelpCircle className="w-8 h-8 stroke-[1.2] mx-auto text-slate-600" />
            <p className="text-xs font-semibold text-slate-400 tracking-tight">Identity database empty</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Either no users were registered, or none match your search query filters. Click 'Register test user' above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold tracking-wider">User Identity</th>
                  <th className="p-4 font-semibold tracking-wider">Role Access</th>
                  <th className="p-4 font-semibold tracking-wider">Registration Status</th>
                  <th className="p-4 font-semibold tracking-wider">Last Sync Activity</th>
                  <th className="p-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/10 transition duration-100">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-indigo-400 border border-indigo-900/30">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-250 flex items-center gap-1.5">
                          <span>{user.displayName}</span>
                          <span className="text-[10px] font-mono text-slate-500">({user.id})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-550" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono select-none">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        user.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : user.role === 'anonymous'
                          ? 'bg-slate-900 text-slate-500 border-slate-800'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 select-none">
                      <div className="flex items-center gap-1.5">
                        {user.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-semibold font-mono uppercase">Active</span>
                          </>
                        ) : user.status === 'pending' ? (
                          <>
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span className="text-xs text-amber-500 font-semibold font-mono uppercase">Pending Approval</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-xs text-rose-400 font-semibold font-mono uppercase">Suspended</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[11px] font-mono text-slate-500 align-middle">
                      {new Date(user.lastSignIn).toLocaleDateString()}<br />
                      {new Date(user.lastSignIn).toLocaleTimeString()}
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap align-middle">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => onUpdateUserStatus(user.id, 'suspended')}
                          className="px-2.5 py-1 text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 rounded cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : user.status === 'pending' ? (
                        <button
                          onClick={() => onUpdateUserStatus(user.id, 'active')}
                          className="px-2.5 py-1 text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:text-indigo-300 hover:bg-[#ffca28]/10 hover:border-[#ffca28]/25 rounded cursor-pointer animate-pulse"
                        >
                          Approve Clearance
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateUserStatus(user.id, 'active')}
                          className="px-2.5 py-1 text-[10px] font-mono bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 hover:border-emerald-555/25 rounded cursor-pointer"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="px-2.5 py-1 text-[10px] font-mono bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-slate-850 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
