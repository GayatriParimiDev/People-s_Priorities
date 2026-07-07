import React, { useState } from "react";
import { 
  Building2, 
  Info, 
  Key, 
  Lock, 
  Mail, 
  Shield, 
  User, 
  Map, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { User as UserType } from "../types";

interface AuthViewProps {
  onLoginSuccess: (user: UserType, token: string) => void;
  setView: (view: any) => void;
}

export default function AuthView({ onLoginSuccess, setView }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"MP" | "MLA" | "ADMINISTRATOR">("MP");
  const [districtId, setDistrictId] = useState("");
  const [office, setOffice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");

  React.useEffect(() => {
    async function fetchConsts() {
      try {
        const res = await fetch("/api/proposals/constituencies");
        if (res.ok) {
          const data = await res.json();
          setConstituencies(data);
          const uniqueStates = Array.from(new Set(data.map((c: any) => c.state))) as string[];
          setStates(uniqueStates);
          if (uniqueStates.length > 0) {
            setSelectedState(uniqueStates[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching constituencies:", err);
      }
    }
    fetchConsts();
  }, []);

  const availableConsts = constituencies.filter(c => 
    c.state === selectedState && 
    c.constituency_type.toLowerCase() === role.toLowerCase()
  );

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { label: "Weak", color: "bg-red-500", percent: 10 };
    let score = 0;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 25 };
    if (score <= 4) return { label: "Moderate", color: "bg-amber-500", percent: 60 };
    return { label: "Strong", color: "bg-emerald-500", percent: 100 };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = activeTab === "login" 
      ? { email, password }
      : { email, password, name, role: role.toLowerCase(), districtId, office };

    const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (activeTab === "login") {
        localStorage.setItem("auth_token", data.token);
        onLoginSuccess(data.user, data.token);
      } else {
        setSuccess("Registration secure. Proceed to sign in.");
        setActiveTab("login");
        setPassword("");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact authorization server.");
      setLoading(false);
    }
  };

  const fillSeedCredential = (type: "mp" | "mla" | "staff" | "admin" | "citizen") => {
    if (type === "mp") {
      setEmail("mp@assembly.gov");
      setPassword("password123");
    } else if (type === "mla") {
      setEmail("mla@assembly.gov");
      setPassword("password123");
    } else if (type === "staff") {
      setEmail("staff@assembly.gov");
      setPassword("password123");
    } else if (type === "admin") {
      setEmail("admin@assembly.gov");
      setPassword("password123");
    } else {
      setEmail("citizen@assembly.gov");
      setPassword("password123");
    }
    setActiveTab("login");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-black font-sans selection:bg-ochre selection:text-white">
      
      {/* Decorative Brand Header */}
      <div className="mb-8 text-center max-w-md">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ochre bg-ochre/10 px-3 py-1 rounded-full border border-ochre/25 inline-block mb-3">
          Authenticated Assembly Hub
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-black uppercase">
          District Legislative Gate
        </h1>
        <p className="text-zinc-600 text-xs mt-2 font-light leading-relaxed">
          Secure, verified node for Members of Parliament and Assembly Administrators. Check parameters, audit ledger logs, and endorse public initiatives.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left column: Brand Context card (Colored block, white text) */}
        <div className="lg:col-span-5 bg-[#FDFBF7] border border-slate-200 rounded-lg p-8 shadow-2xl flex flex-col justify-between space-y-8 text-[#1A1A2E]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-4 uppercase tracking-wide border-b border-slate-200 pb-2">
              Assembly System Roles
            </h2>
            
            <div className="space-y-5">
              {/* MP Role Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#4ECDC4]">
                  <Shield className="w-4 h-4 text-[#4ECDC4]" />
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1A1A2E]">
                    Member of Parliament (MP)
                  </h3>
                </div>
                <p className="text-slate-600 text-xs font-light leading-relaxed pl-6">
                  Assigned to represent individual districts. Empowered to submit verified local initiatives, vote on public proposals, and monitor constituent sentiments.
                </p>
                <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                  <span className="bg-slate-100 text-[#1A1A2E] text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-250 font-bold">Endorse Proposals</span>
                  <span className="bg-slate-100 text-[#1A1A2E] text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-250 font-bold">Submit Initiatives</span>
                </div>
              </div>

              {/* Administrator Role Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#FF6B9D]">
                  <Building2 className="w-4 h-4 text-[#FF6B9D]" />
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1A1A2E]">
                    Assembly Administrator
                  </h3>
                </div>
                <p className="text-slate-600 text-xs font-light leading-relaxed pl-6">
                  Regulates technical and physical state limits. Audits permanent immutable record entries, configures district-wide MFA and logging parameters, and updates archives.
                </p>
                <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                  <span className="bg-slate-100 text-[#1A1A2E] text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-250 font-bold">Audit Records</span>
                  <span className="bg-slate-100 text-[#1A1A2E] text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-250 font-bold">Configure Security</span>
                </div>
              </div>

              {/* Citizen / User Role Details */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#FFD93D]">
                  <User className="w-4 h-4 text-[#FFD93D]" />
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1A1A2E]">
                    Citizen / Public User
                  </h3>
                </div>
                <p className="text-slate-600 text-xs font-light leading-relaxed pl-6">
                  Standard engagement profile. Submits complaints, track milestones, signs public verification ledgers, and participates in local prioritization surveys.
                </p>
                <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                  <span className="bg-slate-100 text-[#1A1A2E] text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-250 font-bold">Submit Grievance</span>
                  <span className="bg-slate-100 text-[#1A1A2E] text-[9px] font-mono uppercase px-2 py-0.5 rounded border border-slate-250 font-bold">Track Engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Access seed panel (Inside dark block, text is white) */}
          <div className="bg-white border border-slate-200 rounded p-4 font-mono text-[11px] space-y-3 text-[#1A1A2E] shadow-sm">
            <div className="flex items-center space-x-2 text-[#1A1A2E]">
              <Key className="w-3.5 h-3.5 text-[#4ECDC4]" />
              <span className="uppercase tracking-wider font-bold text-[#1A1A2E]">Legislative Seed Bypass</span>
            </div>
            <p className="text-slate-500 font-sans text-[10px] leading-relaxed">
              Use these pre-authorized accounts to immediately verify specific permission matrices:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-1 text-center">
              <button 
                type="button"
                onClick={() => fillSeedCredential("mp")}
                className="py-2 px-1 bg-white hover:bg-[#4ECDC4] text-[#1A1A2E] hover:text-[#1A1A2E] rounded border border-slate-250 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans shadow-sm"
              >
                Sign In MP
              </button>
              <button 
                type="button"
                onClick={() => fillSeedCredential("mla")}
                className="py-2 px-1 bg-white hover:bg-[#4ECDC4] text-[#1A1A2E] hover:text-[#1A1A2E] rounded border border-slate-250 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans shadow-sm"
              >
                Sign In MLA
              </button>
              <button 
                type="button"
                onClick={() => fillSeedCredential("staff")}
                className="py-2 px-1 bg-white hover:bg-[#4ECDC4] text-[#1A1A2E] hover:text-[#1A1A2E] rounded border border-slate-250 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans shadow-sm"
              >
                Sign In Staff
              </button>
              <button 
                type="button"
                onClick={() => fillSeedCredential("admin")}
                className="py-2 px-1 bg-white hover:bg-coral text-black hover:text-white rounded border border-white/15 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans"
              >
                Sign In Admin
              </button>
              <button 
                type="button"
                onClick={() => fillSeedCredential("citizen")}
                className="py-2 px-1 bg-white hover:bg-sky-600 text-black hover:text-white rounded border border-white/15 text-[10px] uppercase tracking-wide font-bold transition-all cursor-pointer font-sans col-span-2"
              >
                Sign Citizen
              </button>
            </div>
            <div className="text-[10px] text-center text-white/50 font-mono">
              Universal Password: <span className="text-white/80 font-bold">password123</span>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Form Panel */}
        <div className="lg:col-span-7 bg-zinc-50 text-black border border-zinc-200 rounded p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header Tabs */}
            <div className="flex border-b border-zinc-200 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab("login"); setError(null); }}
                className={`flex-1 pb-3 text-center font-mono text-xs uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "login" 
                    ? "border-black text-black" 
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}
              >
                Secure Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("signup"); setError(null); }}
                className={`flex-1 pb-3 text-center font-mono text-xs uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "signup" 
                    ? "border-black text-black" 
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}
              >
                Register Account
              </button>
            </div>

            {/* Error & Success Feedback banners */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-300 rounded text-red-700 flex items-start space-x-2.5 font-sans text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 flex items-start space-x-2.5 font-sans text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-bold">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Identity Name (Signup only) */}
              {activeTab === "signup" && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Full Identity Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Councilor Eleanor Vance"
                      className="w-full bg-white border border-zinc-200 rounded py-2.5 pl-10 pr-4 text-xs text-black outline-none focus:border-ochre font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Authorized Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. representative@assembly.gov"
                    className="w-full bg-white border border-zinc-200 rounded py-2.5 pl-10 pr-4 text-xs text-black outline-none focus:border-ochre font-sans"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Secured Password</label>
                  {activeTab === "signup" && password.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-ochre">
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-zinc-200 rounded py-2.5 pl-10 pr-4 text-xs text-black outline-none focus:border-ochre font-sans"
                  />
                </div>

                {/* Password Strength bar indicator */}
                {activeTab === "signup" && password.length > 0 && (
                  <div className="w-full bg-zinc-200 h-1 rounded overflow-hidden mt-1.5 transition-all">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                      style={{ width: `${passwordStrength.percent}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Role Selection (Signup only) */}
              {activeTab === "signup" && (
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Designated Role</label>
                    <select
                      value={role}
                      onChange={(e) => {
                        const newRole = e.target.value as any;
                        setRole(newRole);
                        setDistrictId("");
                      }}
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-2.5 text-xs text-black outline-none font-mono tracking-wider cursor-pointer font-bold"
                    >
                      <option value="MP">MP (Parliament Representative)</option>
                      <option value="MLA">MLA (Assembly Representative)</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>

                  {role !== "ADMINISTRATOR" ? (
                    <>
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Select State/UT</label>
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setDistrictId("");
                          }}
                          className="w-full bg-white border border-zinc-200 rounded px-2.5 py-2.5 text-xs text-black outline-none font-sans cursor-pointer font-bold"
                        >
                          {states.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                          Represented {role === "MP" ? "Lok Sabha" : "Vidhan Sabha"} Constituency
                        </label>
                        <select
                          value={districtId}
                          onChange={(e) => setDistrictId(e.target.value)}
                          required
                          className="w-full bg-white border border-zinc-200 rounded px-2.5 py-2.5 text-xs text-black outline-none font-sans cursor-pointer font-bold"
                        >
                          <option value="">-- Choose Constituency --</option>
                          {availableConsts.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Assigned Office</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="text"
                          required
                          value={office}
                          onChange={(e) => setOffice(e.target.value)}
                          placeholder="e.g. Fiscal Auditing"
                          className="w-full bg-white border border-zinc-200 rounded py-2.5 pl-9 pr-4 text-xs text-black outline-none focus:border-ochre font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button &mdash; Colored background, white text */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-ochre hover:bg-ochre/90 text-white rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? "Authenticating Identity..." : activeTab === "login" ? "Verify Security Key" : "Secure Registration"}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-white" />}
              </button>

              {/* Google Login button for users */}
              {activeTab === "login" && (
                <>
                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-zinc-200"></div>
                    <span className="flex-shrink mx-4 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">or sign in with</span>
                    <div className="flex-grow border-t border-zinc-200"></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const backend = window.location.origin.includes("localhost:3000")
                        ? "http://localhost:5000"
                        : window.location.origin.includes("127.0.0.1:3000")
                        ? "http://127.0.0.1:5000"
                        : "";
                      window.location.href = `${backend}/api/auth/google`;
                    }}
                    className="w-full py-3.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-4 h-4 mr-2" alt="Google logo" />
                    <span>Sign in with Google</span>
                  </button>
                </>
              )}

            </form>
          </div>

          {/* Privacy Note */}
          <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center space-x-2 text-[10px] text-zinc-500 font-sans leading-relaxed">
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
          className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-black transition-all cursor-pointer underline underline-offset-4"
        >
          Return to Portal Landing
        </button>
      </div>

    </div>
  );
}
