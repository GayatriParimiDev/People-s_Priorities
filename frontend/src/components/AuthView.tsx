import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Building2, 
  Map, 
  Key,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { User as UserType, ViewState } from "../types";

interface AuthViewProps {
  setView: (view: ViewState) => void;
  onLoginSuccess: (user: UserType, token: string) => void;
}

export default function AuthView({ setView, onLoginSuccess }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"MP" | "ADMINISTRATOR">("MP");
  const [districtId, setDistrictId] = useState("74-B");
  const [office, setOffice] = useState("Infrastructural Oversight");

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password strength logic
  const getPasswordStrength = () => {
    if (password.length === 0) return { label: "", color: "bg-neutral-800", percent: 0 };
    if (password.length < 6) return { label: "Weak", color: "bg-red-500", percent: 33 };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (hasLetters && hasNumbers) {
      return { label: "Strong & Secured", color: "bg-emerald-500", percent: 100 };
    }
    return { label: "Moderate", color: "bg-yellow-500", percent: 66 };
  };

  const passwordStrength = getPasswordStrength();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !password) {
      setError("Email and password fields are required");
      setLoading(false);
      return;
    }

    if (activeTab === "signup" && !name) {
      setError("Please provide your full identity name");
      setLoading(false);
      return;
    }

    const url = activeTab === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body = activeTab === "login" 
      ? { email, password }
      : { email, password, name, role, districtId, office };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An authentication exception occurred");
      }

      setSuccess(activeTab === "login" ? "Identity secured. Access granted." : "Registration secured. Assembly access established.");
      
      // Delay slightly for visual satisfaction
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        setView("DASHBOARD");
      }, 800);

    } catch (err: any) {
      setError(err.message || "Unable to reach security gateway");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill seed accounts
  const fillSeedCredential = (type: "mp" | "admin" | "citizen") => {
    if (type === "mp") {
      setEmail("mp@assembly.gov");
      setPassword("password123");
      setActiveTab("login");
    } else if (type === "admin") {
      setEmail("admin@assembly.gov");
      setPassword("password123");
      setActiveTab("login");
    } else {
      setEmail("citizen@assembly.gov");
      setPassword("password123");
      setActiveTab("login");
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6 text-cream font-sans selection:bg-ochre selection:text-cream">
      
      {/* Decorative Brand Header */}
      <div className="mb-8 text-center max-w-md">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ochre bg-ochre/10 px-3 py-1 rounded-full border border-ochre/20 inline-block mb-3">
          Authenticated Assembly Hub
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-cream uppercase">
          District Legislative Gate
        </h1>
        <p className="text-sage text-xs mt-2 font-light leading-relaxed">
          Secure, verified node for Members of Parliament and Assembly Administrators. Check parameters, audit ledger logs, and endorse public initiatives.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: Information & Roles Panel (Light Theme styled) */}
        <div className="lg:col-span-5 bg-navy text-cream border border-sage/40 rounded p-8 flex flex-col justify-between space-y-8 shadow-2xl">
          <div>
            <h2 className="font-serif text-xl font-bold text-cream mb-4 uppercase tracking-wide border-b border-cream/10 pb-2">
              Assembly System Roles
            </h2>
            
            <div className="space-y-5">
              {/* MP Role Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-ochre">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-cream">
                    Member of Parliament (MP)
                  </h3>
                </div>
                <p className="text-cream/70 text-xs font-light leading-relaxed pl-6">
                  Assigned to represent individual districts. Empowered to submit verified local initiatives, vote on public proposals, and monitor constituent sentiments.
                </p>
                <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-amber-200">Endorse Proposals</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-amber-200">Submit Initiatives</span>
                </div>
              </div>

              {/* Administrator Role Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-coral">
                  <Building2 className="w-4 h-4 text-red-700" />
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-cream">
                    Assembly Administrator
                  </h3>
                </div>
                <p className="text-cream/70 text-xs font-light leading-relaxed pl-6">
                  Regulates technical and physical state limits. Audits permanent immutable record entries, configures district-wide MFA and logging parameters, and updates archives.
                </p>
                <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                  <span className="bg-red-100 text-red-800 text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-red-200">Audit Records</span>
                  <span className="bg-red-100 text-red-800 text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-red-200">Configure Security</span>
                </div>
              </div>

              {/* Citizen / User Role Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <User className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-cream">
                    Citizen / Public User
                  </h3>
                </div>
                <p className="text-cream/70 text-xs font-light leading-relaxed pl-6">
                  Standard constituents who can check personal engagement metrics, submit new legislative suggestions, and track their participation score.
                </p>
                <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                  <span className="bg-indigo-100 text-indigo-800 text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-indigo-200">Submit Suggestions</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-indigo-200">Track Engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Access seed panel (Light Theme styled) */}
          <div className="bg-cream/5 border border-cream/10 rounded p-4 font-mono text-[11px] space-y-3">
            <div className="flex items-center space-x-2 text-cream">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              <span className="uppercase tracking-wider font-bold text-cream">Legislative Seed Bypass</span>
            </div>
            <p className="text-cream/60 font-sans text-[10px] leading-relaxed">
              Use these pre-authorized accounts to immediately verify specific permission matrices:
            </p>
            <div className="grid grid-cols-3 gap-2 mt-1 text-center">
              <button 
                onClick={() => fillSeedCredential("mp")}
                className="py-2 px-1 bg-cream hover:bg-ochre text-navy rounded border border-cream/15 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans"
              >
                Sign In MP
              </button>
              <button 
                onClick={() => fillSeedCredential("admin")}
                className="py-2 px-1 bg-cream hover:bg-coral text-navy rounded border border-cream/15 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans"
              >
                Sign In Admin
              </button>
              <button 
                onClick={() => fillSeedCredential("citizen")}
                className="py-2 px-1 bg-cream hover:bg-indigo-600 text-navy rounded border border-cream/15 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans"
              >
                Sign Citizen
              </button>
            </div>
            <div className="text-[10px] text-center text-cream/50 font-mono">
              Universal Password: <span className="text-cream/80 font-bold">password123</span>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Form Panel */}
        <div className="lg:col-span-7 bg-cream text-navy border border-sage rounded p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header Tabs */}
            <div className="flex border-b border-navy/10 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab("login"); setError(null); }}
                className={`flex-1 pb-3 text-center font-mono text-xs uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "login" 
                    ? "border-navy text-navy" 
                    : "border-transparent text-navy/40 hover:text-navy/70"
                }`}
              >
                Secure Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("signup"); setError(null); }}
                className={`flex-1 pb-3 text-center font-mono text-xs uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "signup" 
                    ? "border-navy text-navy" 
                    : "border-transparent text-navy/40 hover:text-navy/70"
                }`}
              >
                Register Account
              </button>
            </div>

            {/* Error & Success Feedback banners */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-100 border border-red-300 rounded text-red-700 flex items-start space-x-2.5 font-sans text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 bg-emerald-100 border border-emerald-300 rounded text-emerald-800 flex items-start space-x-2.5 font-sans text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-bold">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Identity Name (Signup only) */}
              {activeTab === "signup" && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] text-navy/60 uppercase tracking-wider block">Full Identity Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Councilor Eleanor Vance"
                      className="w-full bg-navy/5 border border-navy/15 rounded py-2.5 pl-10 pr-4 text-xs text-navy outline-none focus:border-ochre font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-navy/60 uppercase tracking-wider block">Authorized Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. representative@assembly.gov"
                    className="w-full bg-navy/5 border border-navy/15 rounded py-2.5 pl-10 pr-4 text-xs text-navy outline-none focus:border-ochre font-sans"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] text-navy/60 uppercase tracking-wider block">Secured Password</label>
                  {activeTab === "signup" && password.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-ochre">
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-navy/5 border border-navy/15 rounded py-2.5 pl-10 pr-4 text-xs text-navy outline-none focus:border-ochre font-sans"
                  />
                </div>

                {/* Password Strength bar indicator */}
                {activeTab === "signup" && password.length > 0 && (
                  <div className="w-full bg-neutral-200 h-1 rounded overflow-hidden mt-1.5 transition-all">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                      style={{ width: `${passwordStrength.percent}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Role Selection (Signup only) */}
              {activeTab === "signup" && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-navy/60 uppercase tracking-wider block">Designated Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-navy/5 border border-navy/15 rounded px-2.5 py-2.5 text-xs text-navy outline-none font-mono tracking-wider cursor-pointer font-bold"
                    >
                      <option value="MP">MP (Representative)</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>

                  {/* Contextual Input (District for MP, Office for Admin) */}
                  {role === "MP" ? (
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] text-navy/60 uppercase tracking-wider block">Represented District</label>
                      <div className="relative">
                        <Map className="absolute left-3 top-3 w-3.5 h-3.5 text-navy/40" />
                        <input
                          type="text"
                          required
                          value={districtId}
                          onChange={(e) => setDistrictId(e.target.value)}
                          placeholder="e.g. 74-B"
                          className="w-full bg-navy/5 border border-navy/15 rounded py-2.5 pl-9 pr-4 text-xs text-navy outline-none focus:border-ochre font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] text-navy/60 uppercase tracking-wider block">Assigned Office</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-3.5 h-3.5 text-navy/40" />
                        <input
                          type="text"
                          required
                          value={office}
                          onChange={(e) => setOffice(e.target.value)}
                          placeholder="e.g. Fiscal Auditing"
                          className="w-full bg-navy/5 border border-navy/15 rounded py-2.5 pl-9 pr-4 text-xs text-navy outline-none focus:border-ochre font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-navy hover:bg-ochre text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? "Authenticating Identity..." : activeTab === "login" ? "Verify Security Key" : "Secure Registration"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Google Login button for users */}
              {activeTab === "login" && (
                <>
                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-cream/10"></div>
                    <span className="flex-shrink mx-4 text-cream/40 font-mono text-[9px] uppercase tracking-wider">or sign in with</span>
                    <div className="flex-grow border-t border-cream/10"></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="w-full py-3.5 bg-white border border-cream/15 text-cream hover:bg-neutral-50 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-4 h-4 mr-2" alt="Google logo" />
                    <span>Sign in with Google</span>
                  </button>
                </>
              )}

            </form>
          </div>

          {/* Privacy Note */}
          <div className="mt-8 pt-4 border-t border-navy/10 flex items-center space-x-2 text-[10px] text-navy/50 font-sans leading-relaxed">
            <Info className="w-4 h-4 text-ochre shrink-0" />
            <span>
              All legislative actions, logins, and settings updates are permanently audited into the district immutable timeline registries.
            </span>
          </div>

        </div>

      </div>

      {/* Return to Public landing */}
      <div className="mt-8">
        <button 
          onClick={() => setView("LANDING")}
          className="text-xs font-mono uppercase tracking-widest text-sage hover:text-cream transition-all cursor-pointer underline underline-offset-4"
        >
          Return to Portal Landing
        </button>
      </div>

    </div>
  );
}
