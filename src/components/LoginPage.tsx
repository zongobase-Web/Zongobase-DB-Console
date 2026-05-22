import React, { useState, useEffect } from "react";
import { Shield, Key, Eye, EyeOff, Loader2, Database, Code, CircleAlert, Sparkles, Terminal, Info, CheckCircle2, FlaskConical, Command, ArrowLeft, Mail, RefreshCw, AlertCircle, HelpCircle, Lock, LockOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from "firebase/auth";
import { getApiUrl, getBackendOrigin, setCustomApiUrl, isExternalHost } from "../utils/api";

// Real Firebase Config credentials provided by user
const firebaseConfig = {
  apiKey: "AIzaSyALETF5PS0P-LqaolybmjFPmTq-0T5herM",
  authDomain: "zongobase-83236.firebaseapp.com",
  projectId: "zongobase-83236",
  storageBucket: "zongobase-83236.firebasestorage.app",
  messagingSenderId: "486530225611",
  appId: "1:486530225611:web:51702a23bdd42dd043124e",
  measurementId: "G-X44HG25F8D"
};

// Initialize Client Credentials App safely and gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onBackToHome?: () => void;
}

export default function LoginPage({ onLoginSuccess, onBackToHome }: LoginPageProps) {
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  // Verification Code State (Used ONLY for local/mock fallback accounts bypass logs)
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [systemLogsAlert, setSystemLogsAlert] = useState<{ visible: boolean; code: string; email: string } | null>(null);

  // Backend dynamic origin configuration & diagnostics
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrlInput, setCustomApiUrlInput] = useState(() => getBackendOrigin());
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'unchecked' | 'checking' | 'connected' | 'failed'>('unchecked');

  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      setApiConnectionStatus('checking');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const res = await fetch(getApiUrl("/api/health"), { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        clearTimeout(timeoutId);
        if (active) {
          if (res.ok) {
            setApiConnectionStatus('connected');
          } else {
            setApiConnectionStatus('failed');
          }
        }
      } catch (err) {
        if (active) {
          setApiConnectionStatus('failed');
        }
      }
    };
    checkConnection();
    return () => { active = false; };
  }, []);

  // Hidden keyboard shortcut combo: Ctrl + Alt + A to toggle Root Admin Gateway!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAdminPortal((prev) => !prev);
        setIsRegister(false);
        setErrorMsg("");
        setInfoMsg("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Request the Email verification code for seeded/fallback users
  const handleRequestCode = async () => {
    if (!email) {
      setErrorMsg("Please write your email address in the field above to receive a code.");
      return;
    }
    setErrorMsg("");
    setInfoMsg("");
    setIsSendingCode(true);
    try {
      const res = await fetch(getApiUrl("/api/zongobase/auth/send-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed sending verification credentials.");
      }
      
      setCodeSent(true);
      setSystemLogsAlert({
        visible: true,
        code: data.code,
        email: email
      });
      
      // Auto-hide alert after 15 seconds
      setTimeout(() => {
        setSystemLogsAlert(prev => prev && prev.email === email ? { ...prev, visible: false } : prev);
      }, 15000);

    } catch (err: any) {
      setErrorMsg(err.message || "Email validation routing failed.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handles unified, cross-origin robust DB REST Authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (isRegister) {
        // Direct REST Register call (no client-side Firebase Auth dependencies)
        const res = await fetch(getApiUrl("/api/zongobase/auth/register"), {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            displayName: displayName.trim() || cleanEmail.split("@")[0]
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Direct registration failed.");
        }

        // Successfully registered users are placed in pending queue
        setInfoMsg("🎉 Registration Successful! Your developer clearance has been booked. Your account is currently in the administrator's review queue. Please ask the administrator to activate your status in the Users Manager console, after which you can immediately log in.");
        setIsRegister(false); // Toggle to login tab
        setPassword(""); // Clear field for stability
      } else {
        // Direct REST Login call (handles both seeded templates and custom users)
        const res = await fetch(getApiUrl("/api/zongobase/auth/login"), {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            verificationCode: verificationCode.trim()
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Direct REST authentication failed.");
        }

        if (data.user) {
          if (isAdminPortal && data.user.role !== "admin") {
            throw new Error("Privilege Validation Failed: Account fails Root Admin security checks.");
          }
          onLoginSuccess(data.user);
        } else {
          throw new Error("Invalid response keys received from validation node.");
        }
      }
    } catch (err: any) {
      console.error("Secure REST auth error:", err);
      let localizedError = err.message;
      if (localizedError?.includes("failed to fetch") || localizedError?.includes("Failed to fetch") || localizedError?.includes("NetworkError")) {
        localizedError = "Failed to Fetch: Standard cross-origin browser network query to the proxy server was blocked or timed out. Please check that your Cloud Run backend is online, or click SETTINGS below to override your REST API origin URL manually.";
      }
      setErrorMsg(localizedError || "Credential validation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth actual Federated Sign In Popup with Sandbox fallback
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      const syncRes = await fetch(getApiUrl("/api/zongobase/auth/firebase-sync"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "Google Developer",
          method: "google"
        })
      });

      if (!syncRes.ok) {
        const syncData = await syncRes.json();
        throw new Error(syncData.error || "Synchronizing Google authentication session failed.");
      }

      const syncData = await syncRes.json();
      onLoginSuccess(syncData.user);

    } catch (err: any) {
      console.error("Google login error:", err);
      // Give extremely helpful advice for sandboxed iframe environments
      if (err.code === "auth/unauthorized-domain" || err.message?.includes("unauthorized-domain") || err.message?.includes("unauthorized domain")) {
        setUnauthorizedDomain(window.location.hostname);
        setErrorMsg(`Firebase Authorized Domain Restricted: Google login was initiated from a domain not yet whitelisted in your Firebase configuration.`);
      } else if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request" || err.message?.includes("cross-origin")) {
        setErrorMsg("Sandbox Limitation: Google sign-in popups are blocked inside the iframe layout. Click 'Open in a New Tab' at the top right of the screen or use standard credentials.");
      } else {
        setErrorMsg(err.message || "Google Authenticator flow interrupted.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectPreset = (type: "admin" | "user") => {
    setErrorMsg("");
    setInfoMsg("");
    setCodeSent(false);
    if (type === "admin") {
      setIsAdminPortal(true);
      setIsRegister(false);
      setEmail("admin@zongobase.com");
      setPassword("admin*");
      setVerificationCode("");
      setInfoMsg("Configured Default Root Admin. Bypass code activated, press 'Decrypt Master Vault' to open.");
    } else {
      setIsAdminPortal(false);
      setIsRegister(false);
      setEmail("dev@zongobase.com");
      setPassword("dev*");
      setVerificationCode("");
      setInfoMsg("Configured Default Developer. Bypass code activated, press 'Sign in to Console' to open.");
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#131416] flex flex-col items-center justify-center p-4 sm:p-12 text-[#f0f4f9] relative overflow-hidden font-sans select-none">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full transition-all duration-700 pointer-events-none blur-[150px] bg-[#4285f4]/8" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full transition-all duration-700 pointer-events-none blur-[150px] bg-[#9b51e0]/8" />
      
      {/* Developer mesh grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Verification alerts / toast notifications */}
      <AnimatePresence>
        {systemLogsAlert && systemLogsAlert.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-[420px] bg-[#1e1e20] border-l-4 border-[#8ab4f8] rounded-xl shadow-2xl z-50 p-4 font-mono select-text text-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <div className="bg-[#131416] p-2 rounded-lg text-[#8ab4f8]">
                  <Mail className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">📩 Incoming Security Auth Code</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verification message routed for: <strong className="text-slate-200">{systemLogsAlert.email}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => setSystemLogsAlert(prev => prev ? { ...prev, visible: false } : null)}
                className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-[#131416] p-3 rounded-lg border border-slate-800 my-2.5 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">Auth Passcode:</span>
              <span className="text-lg font-bold text-[#8ab4f8] tracking-widest bg-slate-900/80 px-3 py-1 rounded select-all font-mono">
                {systemLogsAlert.code}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              ℹ️ Copy this 6-digit credential and paste it into the "Verification Code" input block below to secure your tenant seat. Zero cost, immediate authentication.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg z-10 flex flex-col gap-6">
        
        {/* Navigation Breadcrumb back to dynamic Landing */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            id="btn-back-home"
            className="self-start inline-flex items-center gap-2 text-xs text-[#8e918f] hover:text-[#f0f4f9] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to welcome homepage</span>
          </button>
        )}

        {/* Console Box Container */}
        <div className="bg-[#1e1f20] border border-[#2d2f31] rounded-2xl p-6 sm:p-8 shadow-[0_20px_45px_0_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Admin Override Lock Toggler Button in Corner */}
          <button
            type="button"
            onClick={() => {
              setIsAdminPortal((prev) => !prev);
              setIsRegister(false);
              setErrorMsg("");
              setInfoMsg("");
            }}
            id="btn-toggle-admin-portal"
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-[#8ab4f8] bg-[#131416]/60 hover:bg-slate-900 border border-[#2d2f31] hover:border-[#8ab4f8]/30 transition-all cursor-pointer z-20 flex items-center justify-center gap-1.5 shadow-md"
            title={isAdminPortal ? "Switch to Regular User/Developer Mode" : "Configure for Admin & Developer Accounts"}
          >
            {isAdminPortal ? <LockOpen className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[10px] font-mono tracking-wider text-slate-450 font-bold hidden sm:inline">
              {isAdminPortal ? "DEV AREA" : "LOCK PORTAL"}
            </span>
          </button>
          
          {/* Header Title displaying master styled branding */}
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-[#2d2f31] mb-6">
            <div className="relative animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4] via-[#9b51e0] to-[#e040fb] rounded-full blur-md opacity-55" />
              <div className="w-12 h-12 rounded-xl bg-[#131416] border border-[#2d2f31] flex items-center justify-center relative">
                <Sparkles className="w-6 h-6 text-[#8ab4f8]" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#f0f4f9] font-sans">
                {isAdminPortal ? "ZongoBase Admin Console" : isRegister ? "Create ZongoBase Account" : "Sign in to ZongoBase"}
              </h1>
              <p className="text-xs text-[#c4c7c5] max-w-sm leading-relaxed">
                {isAdminPortal 
                  ? "Access root node collections and telemetry logs via system override portal." 
                  : isRegister 
                    ? "Register developer telemetry sandboxes linked with Secure Federated Identity." 
                    : "Use your federated database credentials to access secure cloud spaces."}
              </p>
            </div>
          </div>

          {/* Root status validation badge for user feedback */}
          {isAdminPortal && (
            <div className="mb-5 p-2 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-400 font-mono text-[10px]">
              <Shield className="w-4 h-4 shrink-0 text-amber-500" />
              <span>SYSTEM ROOT OVERRIDE VAULT IS ACTIVE</span>
            </div>
          )}

          {/* Custom Tabs */}
          {!isAdminPortal && (
            <div className="flex bg-[#131416] p-1 rounded-lg border border-[#2d2f31] mb-6">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(""); setInfoMsg(""); }}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  !isRegister ? "bg-[#1e1f20] text-[#f0f4f9] shadow-sm font-bold" : "text-[#c4c7c5] hover:text-[#f0f4f9]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(""); setInfoMsg(""); }}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isRegister ? "bg-[#1e1f20] text-[#f0f4f9] shadow-sm font-bold" : "text-[#c4c7c5] hover:text-[#f0f4f9]"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Dual authentication selection */}
          <div className="space-y-4">
            
            {/* Real Google Signin */}
            {!isAdminPortal && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-[#1e1f20] hover:bg-[#2d2f31] border border-[#2d2f31]/80 text-[#f0f4f9] font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-sm disabled:opacity-55"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-grow h-[1px] bg-[#2d2f31]" />
                  <span className="text-[10px] text-[#8e918f] font-mono uppercase tracking-wider">or email password auth</span>
                  <div className="flex-grow h-[1px] bg-[#2d2f31]" />
                </div>
              </>
            )}

            {/* Error notifications */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex flex-col gap-2"
                >
                  <div className="flex gap-2.5 items-start">
                    <CircleAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>

                  {unauthorizedDomain && (
                    <div className="mt-2.5 p-3 rounded-lg bg-slate-900 border border-amber-500/30 text-slate-300 space-y-2 text-left font-sans">
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[9px] uppercase font-bold">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>How to fix: Authorize Domain in Firebase</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        Google OAuth prevents authentication flows from domains that aren't specifically whitelisted. Let's fix this in 3 quick steps:
                      </p>
                      <ol className="list-decimal list-inside text-[10.5px] space-y-1 text-slate-300 font-sans pl-1">
                        <li>
                          Open your <a href="https://console.firebase.google.com/project/zongobase-83236/authentication/providers" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300 inline font-semibold">Firebase Console Settings</a>.
                        </li>
                        <li>
                          Navigate to <strong className="text-slate-200">Authentication</strong> &rarr; <strong className="text-slate-200">Settings</strong> &rarr; <strong className="text-slate-200">Authorized domains</strong>.
                        </li>
                        <li>
                          Click <strong className="text-slate-200">"Add domain"</strong> and paste this exact address:
                          <div className="my-1.5 flex items-center justify-between bg-[#131416] p-2 rounded border border-slate-750 font-mono text-amber-400 text-xs select-all">
                            <span>{unauthorizedDomain}</span>
                          </div>
                        </li>
                      </ol>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info notifications */}
            <AnimatePresence mode="wait">
              {infoMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex gap-2.5 items-start"
                >
                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Display Name for registering users */}
              {isRegister && (
                <div>
                  <label className="block text-[10px] font-mono text-[#c4c7c5] mb-1.5 tracking-wider font-semibold">DEVELOPER VISUAL DESIGNATION</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Elena Rostova"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#131416] hover:bg-[#1e1f20] focus:bg-[#131416] border border-[#2d2f31] focus:border-[#8ab4f8] text-xs text-[#f0f4f9] rounded-lg px-3.5 py-2.5 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Email address field */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 tracking-wider lowercase">email</label>
                <input 
                  type="email" 
                  required 
                  placeholder={isAdminPortal ? "admin@zongobase.com" : "developer@zongobase.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#131416] hover:bg-[#1e1f20] focus:bg-[#131416] border border-[#2d2f31] focus:border-[#8ab4f8] text-xs text-[#f0f4f9] rounded-lg px-3.5 py-2.5 focus:outline-none transition-colors"
                />
              </div>

              {/* Cryptographic password */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 tracking-wider lowercase">
                  {isRegister || isAdminPortal ? "pass-phrase" : "password"}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#131416] hover:bg-[#1e1f20] focus:bg-[#131416] border border-[#2d2f31] focus:border-[#8ab4f8] text-xs text-[#f0f4f9] rounded-lg pl-3.5 pr-10 py-2.5 focus:outline-none transition-colors font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#8e918f] hover:text-[#f0f4f9] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secure Active channel validation label */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase bg-slate-900/30 p-2.5 border border-slate-800 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4285f4] animate-pulse shrink-0" />
                <span>Verified Direct auth to secure tenant server</span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#131416] font-bold text-xs font-mono uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-blue-900/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>{isAdminPortal ? "Decrypt Master Vault" : isRegister ? "Register Securely" : "Sign in to Console"}</span>
                  </>
                )}
              </button>
            </form>
              
              {/* Active Backend Connection Tray */}
              <div className="mt-4 p-3 rounded-xl bg-[#131416]/90 border border-[#2d2f31] space-y-2.5 text-left">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5 uppercase font-semibold">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span>ZongoBase Active Gateway</span>
                  </span>
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      apiConnectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                      apiConnectionStatus === 'checking' ? 'bg-violet-400 animate-pulse' :
                      apiConnectionStatus === 'failed' ? 'bg-rose-500' : 'bg-slate-500'
                    }`} />
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${
                      apiConnectionStatus === 'connected' ? 'text-emerald-400' :
                      apiConnectionStatus === 'checking' ? 'text-violet-400' :
                      apiConnectionStatus === 'failed' ? 'text-rose-450 font-semibold' : 'text-slate-400'
                    }`}>
                      {apiConnectionStatus === 'connected' ? 'ONLINE' :
                       apiConnectionStatus === 'checking' ? 'TESTING...' :
                       apiConnectionStatus === 'failed' ? 'FAILED TO FETCH' : 'UNCHECKED'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowApiSettings(!showApiSettings)}
                      className="ml-1 text-[#8ab4f8] hover:underline cursor-pointer font-bold text-[8.5px] uppercase tracking-wider bg-indigo-500/10 hover:bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono"
                    >
                      {showApiSettings ? 'CLOSE' : 'SETTINGS'}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 break-all bg-black/40 p-2 rounded border border-[#2d2f31] flex items-center justify-between gap-1 select-all">
                  <span className="text-slate-300 font-sans font-bold bg-[#1e1f20] px-1.5 py-0.5 rounded text-[8px] border border-slate-750 text-[#8ab4f8] shrink-0 uppercase">
                    {isExternalHost() ? "NETLIFY MODE" : "SANDBOX MODE"}
                  </span>
                  <span className="truncate flex-1 text-right font-mono text-[10px] text-slate-400 font-medium">{getBackendOrigin()}</span>
                </div>

                {showApiSettings && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-2 border-t border-[#2d2f31]/60"
                  >
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Outside of standard sandboxes, your browser calls the dynamic Shared App URL which is publicly exposed. You can explicitly connect to any other custom ZongoBase REST API URL here:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. https://my-custom-zongobase.run.app"
                        value={customApiUrlInput}
                        onChange={(e) => setCustomApiUrlInput(e.target.value)}
                        className="flex-1 bg-black/60 border border-slate-800 rounded px-2.5 py-1.5 text-[10.5px] text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomApiUrl(customApiUrlInput || null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] px-2.5 py-1.5 rounded cursor-pointer font-mono uppercase shrink-0"
                      >
                        SET & RELOAD
                      </button>
                    </div>
                    {customApiUrlInput !== getBackendOrigin() && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomApiUrl(null);
                            setCustomApiUrlInput(getBackendOrigin());
                          }}
                          className="text-[9px] text-slate-500 hover:text-slate-300 underline font-mono"
                        >
                          RESTORE SYSTEM DEFAULT URL
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

          <div className="mt-6 border-t border-[#2d2f31] pt-4 flex items-center justify-between text-[10px] font-mono text-[#8e918f]">
            <span>VAULT CIPHER: SHA-256</span>
            <span className="text-[#8ab4f8] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8ab4f8] animate-pulse" />
              <span>ACTIVE DATABASE SECURITY TARIFF</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
