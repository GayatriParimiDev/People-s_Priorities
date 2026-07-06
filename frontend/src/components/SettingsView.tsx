import React, { useState } from "react";
import { 
  Shield, 
  Map, 
  Languages, 
  Plus, 
  Globe, 
  Lock, 
  Check, 
  RefreshCw,
  User as UserIcon,
  LogOut,
  Sliders,
  Send,
  Archive,
  Key,
  KeyRound,
  ShieldAlert,
  SlidersHorizontal,
  FolderLock
} from "lucide-react";
import { DistrictConfig, User } from "../types";

interface SettingsViewProps {
  config: DistrictConfig;
  onUpdateConfig: (newConfig: DistrictConfig) => void;
  currentUser: User | null;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  setView: (view: any) => void;
}

export default function SettingsView({ 
  config, 
  onUpdateConfig,
  currentUser,
  onLogout,
  onUpdateUser,
  setView
}: SettingsViewProps) {
  const [districtId, setDistrictId] = useState(config.districtId);
  const [representative, setRepresentative] = useState(config.representative);
  const [mfaEnabled, setMfaEnabled] = useState(config.mfaEnabled);
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(config.auditLoggingEnabled);
  const [language, setLanguage] = useState(config.language);
  const [languages, setLanguages] = useState(config.languages);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile edit states
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profileDistrict, setProfileDistrict] = useState(currentUser?.districtId || "");
  const [profileOffice, setProfileOffice] = useState(currentUser?.office || "");
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatarUrl || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfileDistrict(currentUser.districtId || "");
      setProfileOffice(currentUser.office || "");
      setProfileAvatar(currentUser.avatarUrl || "");
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          districtId: currentUser?.role === "MP" ? profileDistrict : undefined,
          office: currentUser?.role === "ADMINISTRATOR" ? profileOffice : undefined,
          avatarUrl: profileAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile data");
      }

      onUpdateUser(data.user);
      setProfileSuccess("Identity details updated successfully across legislative registries.");
      setTimeout(() => setProfileSuccess(null), 3500);

      if (data.user.role === "MP") {
        setRepresentative(data.user.name);
        if (data.user.districtId) {
          setDistrictId(data.user.districtId);
        }
      }
    } catch (err: any) {
      setProfileError(err.message || "Unable to register changes");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddLanguage = () => {
    const newLang = prompt("Enter additional language to support:");
    if (newLang && !languages.includes(newLang)) {
      setLanguages([...languages, newLang]);
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          districtId,
          representative,
          mfaEnabled,
          auditLoggingEnabled,
          language,
          languages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update configurations");
      }

      const updated = await response.json();
      onUpdateConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-navy/40 min-h-screen text-cream">
      {/* Header */}
      <div className="border-b border-sage/20 pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-vampiro text-3xl md:text-5xl uppercase tracking-wider text-cream">
            System Configuration
          </h1>
          <p className="text-sage font-sans text-xs mt-3 tracking-wider leading-relaxed font-light">
            Global settings, legislative profile registry, and district-wide parameters.
          </p>
        </div>
      </div>

      {/* Profile & Permissions Block */}
      {!currentUser ? (
        <div className="border border-yellow-500/30 bg-yellow-500/5 rounded p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-yellow-500 shrink-0" />
            <div>
              <h2 className="font-serif text-base font-bold text-yellow-500 uppercase tracking-wide">
                Public Read-Only Session
              </h2>
              <p className="text-sage text-xs font-light leading-relaxed mt-0.5">
                You are currently browsing the legislative system as an unauthenticated guest. Sign in with validated credentials to submit initiatives, endorse proposals, or alter parameters.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setView("AUTH")}
            className="px-5 py-2.5 bg-ochre hover:bg-ochre/90 text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            Sign In / Register
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Profile Form */}
          <div className="lg:col-span-7 border border-sage/25 bg-navy/60 rounded p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-sage/10 pb-3">
              <div className="flex items-center space-x-2 text-ochre">
                <UserIcon className="w-5 h-5" />
                <h2 className="font-vampiro text-base uppercase tracking-wider text-cream">
                  User Profile Management
                </h2>
              </div>
              <span className="font-mono text-[9px] bg-ochre/20 text-ochre border border-ochre/30 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                {currentUser.role}
              </span>
            </div>

            {profileError && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded text-xs font-sans">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded text-xs font-sans">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-sage/60 uppercase tracking-widest block">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream outline-none focus:border-ochre font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-sage/60 uppercase tracking-widest block">Secured Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream outline-none focus:border-ochre font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Conditional Field depending on role */}
                {currentUser.role === "MP" ? (
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-sage/60 uppercase tracking-widest block">Represented District</label>
                    <input
                      type="text"
                      required
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream font-mono uppercase tracking-widest outline-none focus:border-ochre"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-sage/60 uppercase tracking-widest block">Designated Administrative Office</label>
                    <input
                      type="text"
                      required
                      value={profileOffice}
                      onChange={(e) => setProfileOffice(e.target.value)}
                      className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream outline-none focus:border-ochre font-sans"
                    />
                  </div>
                )}

                {/* Simulated cryptographic signature ID */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-sage/60 uppercase tracking-widest block">Legislative Fingerprint (Key ID)</label>
                  <div className="w-full bg-navy/60 border border-sage/15 rounded p-3 text-xs text-sage/50 font-mono flex items-center justify-between select-none">
                    <span>LEG-ID-{currentUser.id.substring(0, 8).toUpperCase()}</span>
                    <KeyRound className="w-3.5 h-3.5 text-ochre/60" />
                  </div>
                </div>
              </div>

              {/* Action buttons inside Profile panel */}
              <div className="flex items-center justify-between pt-4 border-t border-sage/10">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Session</span>
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2 bg-ochre hover:bg-ochre/90 text-cream rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {isUpdatingProfile ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Side: Permissions Card */}
          <div className="lg:col-span-5 border border-sage/25 bg-navy/60 rounded p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-ochre border-b border-sage/10 pb-3 mb-4">
                <FolderLock className="w-5 h-5" />
                <h2 className="font-vampiro text-base uppercase tracking-wider text-cream">
                  Assembly Permissions
                </h2>
              </div>
              
              <p className="text-sage/80 text-xs font-light leading-relaxed mb-4">
                Your account role <span className="font-mono text-[10px] text-cream font-bold bg-ochre px-1.5 py-0.5 rounded">{currentUser.role}</span> holds the following specific verification and action permissions within the District Legislative portal:
              </p>

              {/* Permission Item checklist */}
              <div className="space-y-3 font-sans text-xs">
                
                {/* Perm 1: Submit initiatives */}
                <div className="flex items-center justify-between p-2 rounded bg-black/10">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-cream block">submit_initiatives</span>
                    <span className="text-[9px] text-sage/60">Submit new constituency proposals</span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    currentUser.role === "MP" 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                      : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {currentUser.role === "MP" ? "Authorized" : "Unavailable"}
                  </span>
                </div>

                {/* Perm 2: Endorse proposals */}
                <div className="flex items-center justify-between p-2 rounded bg-black/10">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-cream block">endorse_proposals</span>
                    <span className="text-[9px] text-sage/60">Cast votes on Alpha/Beta plans</span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    currentUser.role === "MP" 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                      : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {currentUser.role === "MP" ? "Authorized" : "Unavailable"}
                  </span>
                </div>

                {/* Perm 3: Edit system configs */}
                <div className="flex items-center justify-between p-2 rounded bg-black/10">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-cream block">modify_district_config</span>
                    <span className="text-[9px] text-sage/60">Alters Geofences and Primary parameters</span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    currentUser.role === "ADMINISTRATOR" 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                      : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {currentUser.role === "ADMINISTRATOR" ? "Authorized" : "Unavailable"}
                  </span>
                </div>

                {/* Perm 4: Manage System Security (MFA / Audit logs) */}
                <div className="flex items-center justify-between p-2 rounded bg-black/10">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-cream block">regulate_security_protocols</span>
                    <span className="text-[9px] text-sage/60">Toggle MFA and real-time ledger auditing</span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    currentUser.role === "ADMINISTRATOR" 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                      : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {currentUser.role === "ADMINISTRATOR" ? "Authorized" : "Unavailable"}
                  </span>
                </div>

              </div>
            </div>

            {/* Simulated verification badge */}
            <div className="border border-sage/15 rounded p-3 bg-black/20 text-[10px] font-mono text-sage/60 text-center mt-4">
              SECURED KEY RING // VERIFIED GATEWAY V1.0.4
            </div>
          </div>

        </div>
      )}

      {/* District Parameters Form */}
      <form onSubmit={handleUpdateSubmit} className="space-y-8 max-w-4xl pt-4">
        
        {/* Module 1: District Parameters */}
        <div className="border border-sage/25 bg-navy/60 rounded p-6 space-y-6 relative">
          <div className="flex items-center space-x-2 text-ochre border-b border-sage/10 pb-3">
            <Map className="w-5 h-5" />
            <h2 className="font-vampiro text-lg uppercase tracking-wider text-cream">
              District Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">District ID</label>
              <input
                type="text"
                disabled={currentUser?.role !== "ADMINISTRATOR"}
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream font-mono uppercase tracking-wider outline-none focus:border-ochre disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">Primary Representative</label>
              <input
                type="text"
                disabled={currentUser?.role !== "ADMINISTRATOR"}
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream font-sans outline-none focus:border-ochre disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Wide Geofence Coordinate satellite overlay module */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">
              Operating Region (Geo-Fence)
            </span>
            <div className="relative aspect-[4/1] w-full border border-sage/20 rounded-lg overflow-hidden bg-neutral-950 flex items-center justify-center">
              <div className="absolute inset-0 grid-bg opacity-30"></div>
              
              {/* Satellite design SVG graphic */}
              <svg viewBox="0 0 800 200" className="absolute inset-0 w-full h-full opacity-40">
                <line x1="0" y1="100" x2="800" y2="100" stroke="var(--color-ochre)" strokeWidth="1" strokeDasharray="5 5" />
                <rect x="50" y="30" width="700" height="140" fill="none" stroke="var(--color-sage)" strokeWidth="1" />
                <polygon points="120,40 680,40 640,160 160,160" fill="none" stroke="var(--color-sage)" strokeWidth="0.5" strokeDasharray="2 2" />
                {/* Horizontal sonar beam */}
                <path d="M 120 100 Q 400 130 680 100" fill="none" stroke="var(--color-ochre)" strokeWidth="1.5" />
                <text x="65" y="155" fill="var(--color-sage)" fillOpacity="0.4" fontSize="8" fontFamily="monospace">GEOFENCE LIMITS // REG_74-B</text>
                <text x="590" y="155" fill="var(--color-sage)" fillOpacity="0.4" fontSize="8" fontFamily="monospace">SAT_FEED_ONLINE // GPS: v2.4</text>
              </svg>

              <div className="relative z-10 text-center space-y-1 select-none">
                <p className="font-mono text-xs text-cream tracking-widest">GEOFENCE SECURED AREA // POLYGON: {districtId}</p>
                <p className="font-mono text-[9px] text-ochre uppercase">Coordinates: 51.512N, -0.136W // Precision standard active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Security Protocols */}
        <div className="border border-sage/25 bg-navy/60 rounded p-6 space-y-6 relative">
          <div className="absolute top-6 right-6 flex items-center space-x-1 border border-red-500/50 text-red-400 bg-red-500/5 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Locked</span>
          </div>

          <div className="flex items-center space-x-2 text-ochre border-b border-sage/10 pb-3">
            <Shield className="w-5 h-5" />
            <h2 className="font-vampiro text-lg uppercase tracking-wider text-cream">
              Security Protocols
            </h2>
          </div>

          <div className="space-y-4 divide-y divide-sage/10">
            {/* Encryption Label */}
            <div className="flex justify-between items-center py-3">
              <div>
                <strong className="text-xs font-mono text-cream tracking-wider block">Ledger Encryption Level</strong>
                <span className="text-[10px] text-sage/60 font-mono">AES-256-GCM / SHA-384 security envelope</span>
              </div>
              <span className="text-xs font-mono font-bold text-ochre uppercase tracking-widest">Maximum</span>
            </div>

            {/* Toggle 1: MFA */}
            <div className="flex justify-between items-center py-4">
              <div>
                <strong className="text-xs font-sans text-cream block">Multi-Factor Auth (MFA)</strong>
                <span className="text-[10px] text-sage/60 font-sans font-light">Required for all representative or administrative profiles</span>
              </div>
              <button
                type="button"
                disabled={currentUser?.role !== "ADMINISTRATOR"}
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  mfaEnabled ? "bg-emerald-500 justify-end" : "bg-neutral-800 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-cream rounded-full flex items-center justify-center">
                  {mfaEnabled && <Check className="w-3 h-3 text-emerald-600" />}
                </span>
              </button>
            </div>

            {/* Toggle 2: Audit Logging */}
            <div className="flex justify-between items-center py-4">
              <div>
                <strong className="text-xs font-sans text-cream block">Audit Logging</strong>
                <span className="text-[10px] text-sage/60 font-sans font-light">Immutable write-only append ledger stream</span>
              </div>
              <button
                type="button"
                disabled={currentUser?.role !== "ADMINISTRATOR"}
                onClick={() => setAuditLoggingEnabled(!auditLoggingEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  auditLoggingEnabled ? "bg-emerald-500 justify-end" : "bg-neutral-800 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-cream rounded-full flex items-center justify-center">
                  {auditLoggingEnabled && <Check className="w-3 h-3 text-emerald-600" />}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Module 3: Localization */}
        <div className="border border-sage/25 bg-navy/60 rounded p-6 space-y-6">
          <div className="flex items-center space-x-2 text-ochre border-b border-sage/10 pb-3">
            <Languages className="w-5 h-5" />
            <h2 className="font-vampiro text-lg uppercase tracking-wider text-cream">
              Localization
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Lang Dropdown */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">Default Interface Language</label>
              <select
                disabled={currentUser?.role !== "ADMINISTRATOR"}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-navy border border-sage/25 rounded p-3 text-xs text-cream outline-none font-mono disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish (ES)">Spanish (ES)</option>
                <option value="Mandarin (ZH)">Mandarin (ZH)</option>
                <option value="French (FR)">French (FR)</option>
              </select>
            </div>

            {/* Supported Lang Tags */}
            <div className="md:col-span-2 space-y-2">
              <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">Multilingual Intake Support</span>
              <div className="flex flex-wrap gap-2 items-center">
                {languages.map(lang => (
                  <span 
                    key={lang} 
                    className="flex items-center space-x-1 px-3 py-1.5 border border-ochre text-ochre bg-ochre/5 rounded-sm font-mono text-[10px] uppercase font-bold"
                  >
                    <span>{lang}</span>
                    <button 
                      type="button" 
                      disabled={currentUser?.role !== "ADMINISTRATOR"}
                      onClick={() => handleRemoveLanguage(lang)}
                      className="ml-1 text-red-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {/* Add Lang button */}
                <button
                  type="button"
                  disabled={currentUser?.role !== "ADMINISTRATOR"}
                  onClick={handleAddLanguage}
                  className="px-3 py-1.5 border border-dashed border-sage/30 hover:border-ochre rounded-sm font-mono text-[10px] uppercase text-sage hover:text-cream transition-colors cursor-pointer inline-flex items-center space-x-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Language</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        {currentUser?.role === "ADMINISTRATOR" ? (
          <div className="flex items-center justify-end space-x-4 border-t border-sage/15 pt-6">
            <button
              type="button"
              onClick={() => {
                setDistrictId(config.districtId);
                setRepresentative(config.representative);
                setMfaEnabled(config.mfaEnabled);
                setAuditLoggingEnabled(config.auditLoggingEnabled);
                setLanguage(config.language);
                setLanguages(config.languages);
              }}
              className="px-6 py-3 border border-sage/35 hover:border-red-500 hover:text-red-400 text-sage rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-8 py-3 bg-ochre hover:bg-ochre/95 text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow transform active:scale-95 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Securing Parameters...</span>
                </>
              ) : (
                <span>Update Configuration</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2.5 text-xs text-sage/50 font-mono py-5 border-t border-sage/15 leading-relaxed bg-black/10 p-4 rounded border border-sage/10">
            <Lock className="w-4 h-4 text-ochre shrink-0" />
            <span>
              District parameters are locked in Read-Only mode for your current authentication level. Administrative edits require role upgrade to Assembly Administrator.
            </span>
          </div>
        )}

        {/* Success dialog overlay info */}
        {saveSuccess && (
          <div className="p-4 border border-emerald-500/40 bg-emerald-950/20 rounded-md flex items-start space-x-3 text-xs max-w-lg">
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">
                Configuration Updated Successfully
              </span>
              <p className="text-sage text-[11px] font-sans font-light mt-0.5 leading-relaxed">
                Security envelopes secured. Metadata has been registered and verified across administrative roles of District {districtId}.
              </p>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
