import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import PublicLanding from "./components/PublicLanding";
import IntakeConsole from "./components/IntakeConsole";
import DashboardView from "./components/DashboardView";
import EvaluationEngine from "./components/EvaluationEngine";
import StatusTimeline from "./components/StatusTimeline";
import LedgerView from "./components/LedgerView";
import SettingsView from "./components/SettingsView";
import AuthView from "./components/AuthView";
import QueueView from "./components/QueueView";
import AuditTrailView from "./components/AuditTrailView";
import FundsView from "./components/FundsView";
import ReportsView from "./components/ReportsView";
import CitizenPortal from "./components/CitizenPortal";
import { LedgerItem, ThemeStat, DistrictConfig, ProposalEndorsements, ViewState, User } from "./types";

const viewToPathMap: Record<ViewState, string> = {
  LANDING: "/",
  AUTH: "/login",
  DASHBOARD: "/dashboard",
  QUEUE: "/queue",
  AUDIT: "/audit",
  FUNDS: "/funds",
  REPORTS: "/reports",
  INTAKE: "/intake",
  EVALUATION: "/evaluation",
  LEDGER: "/ledger",
  SETTINGS: "/settings",
  TIMELINE: "/timeline",
  PROPOSAL_DECISION: "/proposal-decision"
};

const pathToViewMap: Record<string, ViewState> = {
  "/": "LANDING",
  "/login": "AUTH",
  "/dashboard": "DASHBOARD",
  "/queue": "QUEUE",
  "/audit": "AUDIT",
  "/funds": "FUNDS",
  "/reports": "REPORTS",
  "/intake": "INTAKE",
  "/evaluation": "EVALUATION",
  "/ledger": "LEDGER",
  "/settings": "SETTINGS",
  "/timeline": "TIMELINE",
  "/proposal-decision": "PROPOSAL_DECISION"
};

export default function App() {
  // Navigation View State - Defaults to the beautiful Public Landing page
  const [currentView, setView] = useState<ViewState>("LANDING");
  const [citizenTab, setCitizenTab] = useState<"dashboard" | "map" | "report" | "polling" | "announcements" | "status_chat">("dashboard");
  const [auditProposalId, setAuditProposalId] = useState<string | null>(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("current_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Route protection and popstate synchronization
  useEffect(() => {
    if (loading) return;

    const handlePopState = () => {
      const path = window.location.pathname;

      if (!currentUser) {
        if (path === "/" || path === "") {
          setView("LANDING");
        } else {
          if (path !== "/login") {
            window.history.replaceState({}, "", "/login");
          }
          setView("AUTH");
        }
      } else {
        if (currentUser.role === "CITIZEN") {
          if (path.startsWith("/citizen/")) {
            const tab = path.substring(9);
            const validTabs = ["dashboard", "map", "report", "polling", "announcements", "status_chat"];
            if (validTabs.includes(tab)) {
              setCitizenTab(tab as any);
            } else {
              window.history.replaceState({}, "", "/citizen/dashboard");
              setCitizenTab("dashboard");
            }
          } else {
            window.history.replaceState({}, "", "/citizen/dashboard");
            setCitizenTab("dashboard");
          }
          setView("DASHBOARD");
        } else {
          if (path.startsWith("/citizen/")) {
            window.history.replaceState({}, "", "/dashboard");
            setView("DASHBOARD");
          } else {
            const mappedView = pathToViewMap[path];
            if (mappedView) {
              setView(mappedView);
            } else {
              window.history.replaceState({}, "", "/dashboard");
              setView("DASHBOARD");
            }
          }
        }
      }
    };

    handlePopState();

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentUser, loading]);

  const handleLandingNavigate = (view: ViewState) => {
    const path = viewToPathMap[view] || "/";
    window.history.pushState({}, "", path);
    setView(view);
  };

  const handleGeneralNavigate = (view: ViewState) => {
    const path = viewToPathMap[view] || "/dashboard";
    window.history.pushState({}, "", path);
    setView(view);
  };

  const handleCitizenTabNavigate = (tab: "dashboard" | "map" | "report" | "polling" | "announcements" | "status_chat") => {
    window.history.pushState({}, "", `/citizen/${tab}`);
    setCitizenTab(tab);
  };

  // Try to restore user session on initial boot
  useEffect(() => {
    // Check if token exists in URL search params (e.g. from Google login callback redirect)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("auth_token", urlToken);
      sessionStorage.setItem("cta_clicked", "true");
      window.history.replaceState({}, "", "/dashboard");
      setView("DASHBOARD");
    }

    async function restoreSession() {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setCurrentUser(null);
        localStorage.removeItem("current_user");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          localStorage.setItem("current_user", JSON.stringify(data.user));
          
          // Align representative and district if role is MP
          if (data.user.role === "MP") {
            setConfig(prev => ({
              ...prev,
              representative: data.user.name,
              districtId: data.user.districtId || prev.districtId
            }));
          }

          // If the user has a valid session, automatically direct to dashboard if on auth/landing
          const path = window.location.pathname;
          if (path === "/login" || path === "/") {
            setView("DASHBOARD");
            window.history.replaceState({}, "", "/dashboard");
          }
        } else {
          // Token expired or invalid
          setCurrentUser(null);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("current_user");
        }
      } catch (err) {
        console.error("Assembly security gateway connection exception", err);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);



  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("current_user", JSON.stringify(user));

    if (user.role === "MP") {
      setConfig(prev => ({
        ...prev,
        representative: user.name,
        districtId: user.districtId || prev.districtId
      }));
    }

    // Automatically route to DASHBOARD on successful login/signup
    setView("DASHBOARD");
    window.history.pushState({}, "", "/dashboard");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Assembly gateway session logout communication error", err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
    sessionStorage.removeItem("cta_clicked");
    setView("LANDING");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("current_user", JSON.stringify(updatedUser));
    
    if (updatedUser.role === "MP") {
      setConfig(prev => ({
        ...prev,
        representative: updatedUser.name,
        districtId: updatedUser.districtId || prev.districtId
      }));
    }
  };

  // In-memory synced states
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [themes, setThemes] = useState<ThemeStat[]>([]);
  const [config, setConfig] = useState<DistrictConfig>({
    districtId: "74-B",
    representative: "Councilor J. Doe",
    mfaEnabled: true,
    auditLoggingEnabled: true,
    language: "English (US)",
    languages: ["English (US)", "Spanish (ES)", "Mandarin (ZH)"]
  });
  const [endorsements, setEndorsements] = useState<ProposalEndorsements>({
    alphaCount: 1204,
    betaCount: 556,
    alphaPercent: 68,
    betaPercent: 32
  });

  // Initial Sync from Backend APIs
  useEffect(() => {
    async function syncState() {
      try {
        const ledgerRes = await fetch("/api/ledger");
        if (ledgerRes.ok) {
          const data = await ledgerRes.json();
          setLedger(data.ledger);
          setThemes(data.themes);
          setEndorsements(data.endorsements);
          if (data.config) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        console.error("Failed to sync state from Express server, using local fallback.", err);
      }
    }
    syncState();
  }, []);

  // Synchronize actual suggestions from database based on user role/constituency
  useEffect(() => {
    async function fetchDbSuggestions() {
      if (!currentUser) return;
      
      try {
        let url = `/api/proposals?constituency_id=${currentUser.districtId || "74-B"}`;
        
        const token = localStorage.getItem("auth_token");
        const res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const dbProposals = await res.json();
          
          const mapUrgency = (urgency: string): "CRITICAL" | "ELEVATED" | "STANDARD" | "RESOLVED" => {
            const norm = (urgency || "").toUpperCase();
            if (norm === "CRITICAL" || norm === "HIGH") return "CRITICAL";
            if (norm === "ELEVATED" || norm === "MEDIUM") return "ELEVATED";
            if (norm === "RESOLVED") return "RESOLVED";
            return "STANDARD";
          };

          // Map DB suggestions to LedgerItem format
          const mappedLedger: LedgerItem[] = dbProposals.map((s: any) => {
            const proposalId = s.proposal_id || "";
            const created = s.created_at ? new Date(s.created_at) : new Date();
            const dateStr = !isNaN(created.getTime()) ? created.toISOString() : new Date().toISOString();
            
            return {
              id: proposalId.substring(0, 8).toUpperCase() || "UNKNOWN",
              submissionDate: dateStr.replace("T", " ").substring(0, 19) + " UTC",
              priorityLevel: mapUrgency(s.demand_score > 80 ? "CRITICAL" : s.demand_score > 60 ? "ELEVATED" : "STANDARD"),
              theme: s.category || "General",
              title: s.title || "Untitled Issue",
              status: s.status === "proposed" ? "UNDER REVIEW" : s.status === "under_review" ? "UNDER REVIEW" : s.status === "approved" ? "IN PROGRESS" : "ARCHIVED",
              description: s.description || "",
              latitude: parseFloat(s.latitude) || 12.97,
              longitude: parseFloat(s.longitude) || 77.59,
              signatures: s.demand_score_breakdown?.complaint_count || 1,
              verificationStatus: s.status === "proposed" ? "Verified" : "Audited"
            };
          });

          setLedger(mappedLedger);

          // Update themes count dynamically based on the actual DB suggestions
          const themeCounts: Record<string, number> = {};
          mappedLedger.forEach(item => {
            themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
          });

          const updatedThemes = Object.entries(themeCounts).map(([name, count], i) => ({
            id: String(i + 1).padStart(2, "0"),
            name,
            count
          }));
          
          if (updatedThemes.length > 0) {
            setThemes(updatedThemes);
          }
        }
      } catch (err) {
        console.error("Failed to sync database suggestions:", err);
      }
    }
    fetchDbSuggestions();
  }, [currentUser]);

  // Update configuration
  const handleUpdateConfig = (newConfig: DistrictConfig) => {
    setConfig(newConfig);
  };

  // Add a newly submitted ledger item
  const handleAddLedgerItem = (newItem: LedgerItem) => {
    // Add to top of ledger list
    setLedger((prev) => [newItem, ...prev]);

    // Recalculate themes statistics locally
    setThemes((prevThemes) => {
      return prevThemes.map((theme) => {
        if (theme.name === newItem.theme) {
          return { ...theme, count: theme.count + 1 };
        }
        return theme;
      });
    });
  };

  // Endorse proposal
  const handleEndorse = async (proposal: "alpha" | "beta") => {
    try {
      const response = await fetch("/api/ledger/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      });
      if (response.ok) {
        const data = await response.json();
        setEndorsements(data.endorsements);
      }
    } catch (err) {
      // Fallback local update if offline
      setEndorsements((prev) => {
        const alpha = proposal === "alpha" ? prev.alphaCount + 1 : prev.alphaCount;
        const beta = proposal === "beta" ? prev.betaCount + 1 : prev.betaCount;
        const total = alpha + beta;
        return {
          alphaCount: alpha,
          betaCount: beta,
          alphaPercent: Math.round((alpha / total) * 100),
          betaPercent: Math.round((beta / total) * 100),
        };
      });
    }
  };

  // Triggered when clicking "New Initiative +" in Sidebar
  const handleNewInitiative = () => {
    handleGeneralNavigate("INTAKE");
  };

  // Render loading screen during initial session verification
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0B4F92]"></div>
        <p className="mt-4 text-xs font-mono tracking-widest text-[#4F5A6D] uppercase">Securing Legislative Gateway...</p>
      </div>
    );
  }

  // Render Layouts: Landing vs Administrative Dashboard Frame
  if (currentView === "LANDING") {
    return <PublicLanding setView={handleLandingNavigate} ledger={ledger} />;
  }

  if (currentView === "AUTH") {
    return <AuthView setView={handleGeneralNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  // Enforce session login requirement for all administrative pages
  if (!currentUser) {
    return <AuthView setView={handleGeneralNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  // Redirect logged-in citizens to their own dedicated community portal
  if (currentUser.role === "CITIZEN") {
    return (
      <CitizenPortal 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        activeTab={citizenTab}
        setActiveTab={handleCitizenTabNavigate}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F8] text-[#000000] font-sans">
      {/* Global persistent Sidebar layout */}
      <Sidebar 
        currentView={currentView} 
        setView={handleGeneralNavigate} 
        districtId={config.districtId} 
        representative={config.representative}
        onNewInitiative={handleNewInitiative}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main viewport area */}
      <main className="flex-1 overflow-y-auto bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto">
          {currentView === "INTAKE" && (
            <IntakeConsole 
              onAddLedgerItem={handleAddLedgerItem} 
              setView={handleGeneralNavigate} 
            />
          )}

          {currentView === "DASHBOARD" && (
            <DashboardView 
              ledger={ledger} 
              themes={themes} 
              totalDemands={1492 + ledger.length}
              setView={handleGeneralNavigate} 
              currentUser={currentUser}
            />
          )}

          {currentView === "EVALUATION" && (
            <EvaluationEngine 
              endorsements={endorsements} 
              onEndorse={handleEndorse} 
            />
          )}

          {currentView === "TIMELINE" && (
            <StatusTimeline />
          )}

          {currentView === "LEDGER" && (
            <LedgerView 
              ledger={ledger} 
              setView={handleGeneralNavigate} 
            />
          )}

          {currentView === "QUEUE" && (
            <QueueView 
              currentUser={currentUser} 
              setView={handleGeneralNavigate}
              onSelectProposalForAudit={(id) => {
                setAuditProposalId(id);
                handleGeneralNavigate("AUDIT");
              }}
            />
          )}

          {currentView === "AUDIT" && (
            <AuditTrailView 
              currentUser={currentUser} 
              selectedProposalId={auditProposalId}
              setView={handleGeneralNavigate}
            />
          )}

          {currentView === "FUNDS" && (
            <FundsView 
              currentUser={currentUser} 
              setView={handleGeneralNavigate}
            />
          )}

          {currentView === "REPORTS" && (
            <ReportsView 
              currentUser={currentUser} 
              setView={handleGeneralNavigate}
            />
          )}

          {currentView === "SETTINGS" && (
            <SettingsView 
              config={config} 
              onUpdateConfig={handleUpdateConfig} 
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
              setView={handleGeneralNavigate}
            />
          )}
        </div>
      </main>
    </div>
  );
}
