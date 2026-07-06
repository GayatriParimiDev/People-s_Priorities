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
import { LedgerItem, ThemeStat, DistrictConfig, ProposalEndorsements, ViewState, User } from "./types";

export default function App() {
  // Navigation View State - Defaults to the beautiful Public Landing page
  const [currentView, setView] = useState<ViewState>("LANDING");

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Try to restore user session on initial boot
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          
          // Align representative and district if role is MP
          if (data.user.role === "MP") {
            setConfig(prev => ({
              ...prev,
              representative: data.user.name,
              districtId: data.user.districtId || prev.districtId
            }));
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem("auth_token");
        }
      } catch (err) {
        console.error("Assembly security gateway connection exception", err);
      }
    }
    restoreSession();
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem("auth_token", token);

    if (user.role === "MP") {
      setConfig(prev => ({
        ...prev,
        representative: user.name,
        districtId: user.districtId || prev.districtId
      }));
    }
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
    setView("LANDING");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    
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
    setView("INTAKE");
  };

  // Render Layouts: Landing vs Administrative Dashboard Frame
  if (currentView === "LANDING") {
    return <PublicLanding setView={setView} ledger={ledger} />;
  }

  if (currentView === "AUTH") {
    return <AuthView setView={setView} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy text-cream">
      {/* Global persistent Sidebar layout */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        districtId={config.districtId} 
        representative={config.representative}
        onNewInitiative={handleNewInitiative}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main viewport area */}
      <main className="flex-1 overflow-y-auto bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          {currentView === "INTAKE" && (
            <IntakeConsole 
              onAddLedgerItem={handleAddLedgerItem} 
              setView={setView} 
            />
          )}

          {currentView === "DASHBOARD" && (
            <DashboardView 
              ledger={ledger} 
              themes={themes} 
              totalDemands={1492 + ledger.length}
              setView={setView} 
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
              setView={setView} 
            />
          )}

          {currentView === "SETTINGS" && (
            <SettingsView 
              config={config} 
              onUpdateConfig={handleUpdateConfig} 
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
              setView={setView}
            />
          )}
        </div>
      </main>
    </div>
  );
}
