import React, { useState } from "react";
import { 
  Compass, HelpCircle, Send, Check, BookOpen, Sparkles, Mail, 
  Terminal, ShieldCheck, Zap, ChevronRight, Info, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DevMessage } from "../types";

export default function HelpWizard() {
  // Stepper state
  const [step, setStep] = useState<number>(0);
  
  // Feedback email form state
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const steps = [
    {
      title: "1. Create Workspaces",
      description: "Initialize your database container",
      icon: Compass,
      detail: "Go to the 'Web Projects Linker' or 'My NoSQL Database' tab to register a secure namespace workspace. ZongoBase immediately reserves a sandboxed JSON/NoSQL heap mapped to your credentials."
    },
    {
      title: "2. Generate API Tokens",
      description: "Acquire your secure credentials",
      icon: ShieldCheck,
      detail: "Obtain your project's unique access keys. Use these keys in your client applications locally, or safely bind them as environment secrets to shield them from public users."
    },
    {
      title: "3. 1-Line Zero-Config",
      description: "Initialize your app locally",
      icon: Zap,
      detail: "This is our signature market advantage. Run 'npx zongobase link --key=YOUR_SECRET_KEY' in your local frontend console directory. It instantly configures local data mapping proxies and resolves TypeScript typings under 1 second. No bulky modules required."
    },
    {
      title: "4. Deploy Everywhere",
      description: "Host cost-free with standalones",
      icon: Terminal,
      detail: "Generate standalone portable server scripts (PHP VPS or Node files) directly under the 'Export Code' tab. Upload these files to Github, Netlify, Render, or any VPS to gain high-speed cloud clusters at $0 host tariff costs."
    }
  ];

  const faqs = [
    {
      q: "What makes ZongoBase different from database giants?",
      a: "We address setup friction and high pricing. Instead of forcing you to download 50MB of client packages, configure firewall IP rules, or pay heavy subscription costs for small side apps, ZongoBase offers a '1-Line Zero-Config' CLI link. Plus, with our modular standalones, you can host your data cost-free on Netlify or Apache folders."
    },
    {
      q: "How does the Zero-Config Edge Setup function?",
      a: "By invoking 'npx zongobase link', our CLI scans your frontend environment, establishes local file-based testing mocks, and hooks up an encrypted fetch wrapper. This ensures high velocity offline mock previews that translate into live production data streams upon deployment with zero code edits."
    },
    {
      q: "Where is my data hosted?",
      a: "In our playground console, data resides securely inside in-memory transactional buffers. For your live commercial applications, you can export our standalone, hyper-portable PHP/Node single-file databases directly to your personal GitHub, Netlify, or Apache directories, ensuring 100% data sovereignty and absolute zero cost."
    },
    {
      q: "Is there support for standard SQL database tables or strict schemas?",
      a: "ZongoBase utilizes standard, lightning-fast NoSQL schema configurations. Our tables support dynamic key nesting, allowing you to build collections that naturally adapt to your evolving applications on-the-fly."
    }
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderEmail || !messageText) {
      setErrorText("Please fill out your Email and message content.");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");
    
    try {
      const res = await fetch("/api/zongobase/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail,
          senderName,
          subject: subject || "ZongoBase Customer Query",
          text: messageText
        })
      });

      if (!res.ok) {
        throw new Error("Failed to post message to sovereign channels.");
      }

      setSubmitSuccess(true);
      setSenderName("");
      setSenderEmail("");
      setSubject("");
      setMessageText("");
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setErrorText(err.message || "Endpoint error occurred while delivering.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Intro Header */}
      <div className="relative p-6 rounded-2xl border border-[#2d2f31]/80 bg-[#161719] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Sovereign Guided Integration Hub</span>
            </div>
            <h1 className="text-xl font-sans font-extrabold text-[#f0f4f9] tracking-tight">
              Breezy Database Setup & Support Center
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Learn how to connect your applications in seconds, browse comprehensive developer tutorials, and communicate directly with the startup creators.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-slate-300">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>zongobase@gmail.com</span>
          </div>
        </div>
      </div>

      {/* 2-Column Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Easy Setup Wizard (Stepper) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Breezy Setup Wizard</span>
              </h2>
              <div className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`w-4 h-1.5 rounded-full transition-all duration-150 ${
                      i === step ? "bg-cyan-400 w-6" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed">
              ZongoBase is crafted to outpace conventional setup hurdles. Skip the heavyweight config guides and follow this high-performance sequence:
            </p>

            {/* Stepper Grid selectors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {steps.map((s, idx) => {
                const IconComp = s.icon;
                const isSelected = step === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setStep(idx)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold flex flex-col justify-between h-24 duration-150 relative overflow-hidden transition-all ${
                      isSelected 
                        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_4px_20px_-5px_rgba(6,182,212,0.15)]" 
                        : "bg-slate-900/30 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                    <div>
                      <div className="text-[10px] text-slate-500 truncate">{s.description}</div>
                      <div className="font-bold tracking-tight text-[11px] truncate mt-0.5">{s.title.split(". ")[1]}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Detail Explanation Card */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 text-[110px] font-mono leading-none font-black text-slate-850/20 select-none pointer-events-none transform translate-y-8 translate-x-4">
                {step + 1}
              </div>
              <div className="flex gap-2.5 items-center">
                <div className="w-5 h-5 rounded bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {step + 1}
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {steps[step].title}
                </h4>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed font-sans relative z-10">
                {steps[step].detail}
              </p>
            </div>

            {/* Pro Tips / Edge Advice */}
            <div className="flex gap-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 text-slate-400 text-xs">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Why we lead the setup market:</div>
                <p className="text-[11.5px] text-slate-400 leading-normal">
                  Typical database providers involve extensive provisioning, database schemas and complex SDK imports. ZongoBase requires <strong>no setup code changes</strong>. Deploying a single static HTML file is all you need to interact safely.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ accordion */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#161719]/40 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#8ab4f8] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Developer Knowledge Base & FAQs</span>
            </h3>

            <div className="space-y-3.5">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-1 pb-3.5 border-b border-slate-800/60 last:border-b-0 last:pb-0">
                  <h4 className="text-xs font-bold text-slate-250 flex items-start gap-1.5 leading-snug">
                    <span className="text-cyan-500 text-[10px] font-mono shrink-0 mt-0.5">Q.</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-4 font-sans">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: About, Support Contact, Feedback Form */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* About Startup Project Statement */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-tr from-[#1b1a30]/30 to-[#12111f]/60 relative overflow-hidden space-y-3">
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 w-fit">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Project Announcement</span>
            </div>
            
            <h3 className="text-sm font-bold text-white">About the ZongoBase Startup</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              ZongoBase is an ambitious, high-performance database service startup created with the mission to build the fastest, most secure, and completely data-sovereign NoSQL playground platform. 
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              As a lightweight startup, we emphasize simplicity, clean code, cost-free Standalone server deployments, and instant integration tunnels to stand tall alongside industry giants. We would love to hear your questions, feature proposals, and commercial collaborations!
            </p>
          </div>

          {/* Secure Message Delivery Form */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#161719]/90 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#f0f4f9] flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Send direct message to Developer</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Enter your feedback. These messages are delivered clientless straight to our securely decoupled master workspace queues instantly, where developers can inspect and address issues.
              </p>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 font-sans">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Aureli"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white focus:border-cyan-500/50 outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="zongodev@gmail.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white focus:border-cyan-500/50 outline-none font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Topic / Subject</label>
                <input
                  type="text"
                  placeholder="Integration setup query"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-[#2d2f31] p-2.5 rounded-lg text-white focus:border-cyan-500/50 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Message</label>
                <textarea
                  required
                  placeholder="Explain your scenario here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full h-24 text-xs bg-slate-950 border border-[#2d2f31] rounded-lg p-2.5 text-white focus:border-cyan-500/50 outline-none font-sans leading-relaxed resize-none"
                />
              </div>

              {/* Status notifications */}
              <AnimatePresence mode="wait">
                {submitSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-mono tracking-widest flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Message routed to Developer workspace successfully!</span>
                  </motion.div>
                )}
                {errorText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2.5 rounded bg-[#ea4335]/15 border border-[#ea4335]/20 text-[#ea4335] text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorText}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-cyan-600 text-white hover:bg-cyan-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 duration-150 transition-all disabled:opacity-40 select-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending to developer...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Deliver Secure Message</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 font-mono pt-1">
                <span>Or email directly:</span>
                <a href="mailto:zongobase@gmail.com" className="text-cyan-400 underline hover:text-cyan-300">zongobase@gmail.com</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
