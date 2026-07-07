import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, Image as ImageIcon, Camera, Loader2, Sparkles, MapPin } from "lucide-react";
import { LedgerItem, ViewState } from "../types";
import VoiceRecorder from "./VoiceRecorder";

interface IntakeConsoleProps {
  onAddLedgerItem: (item: LedgerItem) => void;
  setView: (view: ViewState) => void;
}

export default function IntakeConsole({ onAddLedgerItem, setView }: IntakeConsoleProps) {
  const [activeTab, setActiveTab] = useState<"TEXT" | "VOICE" | "PHOTO">("TEXT");
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [locationStr, setLocationStr] = useState("LOC: AUTO-DETECT (SOHO, DISTRICT 74-B)");
  const [submittedItem, setSubmittedItem] = useState<LedgerItem | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        // Pre-fill some default photo description based on standard reports
        setPhotoDescription("Visual damage identification showing severe infrastructure decay and water log.");
        setInputText("Severe asphalt damage with heavy pothole density verified by photographic upload.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePhoto = (type: "pothole" | "light" | "water") => {
    if (type === "pothole") {
      setPhotoPreview("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400");
      setPhotoDescription("Severe road pavement failure with high crack density.");
      setInputText("Heavy pothole logged outside the local bus stop. Substructure is severely eroded.");
    } else if (type === "light") {
      setPhotoPreview("https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400");
      setPhotoDescription("Inactive grid solar luminaire on rusty steel mast.");
      setInputText("Solar street light is completely out of commission. Street is dark and unsafe.");
    } else {
      setPhotoPreview("https://images.unsplash.com/photo-1542013936693-8848e5740a9a?auto=format&fit=crop&q=80&w=400");
      setPhotoDescription("Ruptured distribution pipe water flow discharging onto pavement.");
      setInputText("Clean water pipeline rupture discharging clean water onto street for over 48 hours.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSubmitting(true);
    setSubmittedItem(null);

    try {
      const response = await fetch("/api/ledger/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          type: activeTab,
          imagePrompt: activeTab === "PHOTO" ? photoDescription : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit log");
      }

      const data = await response.json();
      onAddLedgerItem(data.item);
      setSubmittedItem(data.item);
      setInputText("");
      setPhotoPreview(null);
      setPhotoDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy text-cream overflow-hidden">
      {/* Top Header Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative min-h-[calc(100vh-60px)]">
        {/* Left Intake Console Side */}
        <div className="p-8 md:p-14 flex flex-col justify-between border-r border-sage/15 relative">
          <div className="max-w-xl w-full mx-auto space-y-8">
            <div>
              <h1 className="font-vampiro text-5xl md:text-7xl leading-none text-cream uppercase tracking-wide">
                VOICE YOUR <br/>
                <span className="text-ochre">VISION</span>
              </h1>
              <p className="text-sage font-sans text-xs mt-4 tracking-wider leading-relaxed font-light">
                Log infrastructural concerns directly to the civic ledger.
                Permanent record system active.
              </p>
            </div>

            {/* Input form container */}
            <div className="border border-sage/30 bg-navy/50 rounded p-6 backdrop-blur-sm relative">
              <div className="absolute top-0 left-4 -translate-y-1/2 bg-navy px-2 text-[10px] font-mono text-ochre uppercase tracking-widest">
                Input Console // Active
              </div>

              {/* Tabs selector */}
              <div className="flex items-center space-x-6 border-b border-sage/20 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => { setActiveTab("TEXT"); setPhotoPreview(null); }}
                  className={`flex items-center space-x-2 font-mono text-xs uppercase tracking-wider cursor-pointer pb-2 -mb-[17px] border-b-2 transition-all ${
                    activeTab === "TEXT" ? "border-ochre text-cream" : "border-transparent text-sage/50"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("VOICE"); setPhotoPreview(null); }}
                  className={`flex items-center space-x-2 font-mono text-xs uppercase tracking-wider cursor-pointer pb-2 -mb-[17px] border-b-2 transition-all ${
                    activeTab === "VOICE" ? "border-ochre text-cream" : "border-transparent text-sage/50"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("PHOTO")}
                  className={`flex items-center space-x-2 font-mono text-xs uppercase tracking-wider cursor-pointer pb-2 -mb-[17px] border-b-2 transition-all ${
                    activeTab === "PHOTO" ? "border-ochre text-cream" : "border-transparent text-sage/50"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Condition rendering based on tab */}
                {activeTab === "VOICE" && (
                  <VoiceRecorder
                    onTranscribed={(transcript) => {
                      setInputText((prev) => prev + (prev ? " " : "") + transcript);
                    }}
                    placeholderText="Speak in Hindi, Kannada, Tamil, Marathi, or English to transcribe."
                    variant="form"
                  />
                )}

                {activeTab === "PHOTO" && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-sage/20 rounded-lg p-4 flex flex-col items-center justify-center bg-navy/30 hover:border-ochre/50 transition-colors relative">
                      {photoPreview ? (
                        <div className="relative w-full aspect-video rounded overflow-hidden border border-sage/20">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-xs text-white rounded hover:bg-black"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Camera className="w-8 h-8 text-sage/40 mx-auto mb-2" />
                          <label className="cursor-pointer font-mono text-xs text-ochre hover:underline block mb-1">
                            <span>Upload Local Photo</span>
                            <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                          </label>
                          <p className="text-[10px] text-sage/50 font-sans">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>

                    {!photoPreview && (
                      <div className="flex flex-col space-y-1">
                        <span className="font-mono text-[10px] text-sage/60">OR SELECT MOCK PHOTO REPORT:</span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSimulatePhoto("pothole")}
                            className="text-[10px] font-mono py-1.5 px-2 border border-sage/20 hover:border-ochre rounded bg-navy hover:bg-ochre/10 cursor-pointer text-left truncate"
                          >
                            Pothole Repair
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulatePhoto("light")}
                            className="text-[10px] font-mono py-1.5 px-2 border border-sage/20 hover:border-ochre rounded bg-navy hover:bg-ochre/10 cursor-pointer text-left truncate"
                          >
                            Broken Lamp
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulatePhoto("water")}
                            className="text-[10px] font-mono py-1.5 px-2 border border-sage/20 hover:border-ochre rounded bg-navy hover:bg-ochre/10 cursor-pointer text-left truncate"
                          >
                            Pipe Burst
                          </button>
                        </div>
                      </div>
                    )}

                    {photoPreview && (
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] text-sage">AI Visual Details Tag:</label>
                        <input
                          type="text"
                          value={photoDescription}
                          onChange={(e) => setPhotoDescription(e.target.value)}
                          className="w-full bg-navy border border-sage/20 rounded p-2 text-xs font-sans text-cream outline-none focus:border-ochre"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Text area */}
                <div className="space-y-1">
                  <label className="font-mono text-[10px] text-sage/60">CONSTITUENT REPRESENTATION / STATEMENT:</label>
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                       activeTab === "TEXT"
                        ? "Describe the infrastructural issue..."
                        : activeTab === "VOICE"
                        ? "Click the microphone button to dictate details..."
                        : "Describe the uploaded visual issue..."
                    }
                    className="w-full bg-navy border border-sage/20 rounded p-3 text-xs font-sans text-cream outline-none focus:border-ochre resize-none"
                  ></textarea>
                </div>

                {/* Submit row */}
                <div className="flex items-center justify-between pt-2 border-t border-sage/15">
                  <div className="flex items-center space-x-2 text-xs font-mono text-sage/60">
                    <MapPin className="w-3.5 h-3.5 text-ochre" />
                    <span className="text-[10px]">{locationStr}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !inputText.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-ochre disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-ochre/90 text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow shadow-black/40 transform active:scale-95 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cream" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Log</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Dynamic Success Notification */}
            {submittedItem && (
              <div className="border border-emerald-500/40 bg-emerald-950/10 p-4 rounded flex items-start space-x-3 text-xs">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <span>AI Analysis Complete // Added to Ledger</span>
                    <span>{submittedItem.id}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-cream">{submittedItem.title}</h4>
                  <p className="text-sage font-sans font-light leading-relaxed text-[11px]">
                    Successfully categorized under <strong className="text-ochre">{submittedItem.theme}</strong> with a <strong className="text-coral">{submittedItem.priorityLevel}</strong> priority rank.
                  </p>
                  <div className="flex space-x-4 pt-1">
                    <button onClick={() => setView("LEDGER")} className="font-mono text-[10px] text-emerald-400 hover:underline">View Public Ledger →</button>
                    <button onClick={() => setView("DASHBOARD")} className="font-mono text-[10px] text-sage hover:underline">View Map Hotspots →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Frame Side (Brutalist Concrete Graphic Overlaid) */}
        <div className="relative bg-neutral-900 border-t lg:border-t-0 lg:border-l border-sage/20 flex flex-col justify-end p-8 md:p-12 overflow-hidden select-none min-h-[350px]">
          {/* Brutalist image placeholder */}
          <div className="absolute inset-0 bg-navy/35 mix-blend-multiply z-10 pointer-events-none"></div>
          
          {/* Aesthetic grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-40 z-0"></div>

          {/* Concrete structure SVG Artwork */}
          <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full object-cover opacity-25">
            <line x1="0" y1="50" x2="800" y2="550" stroke="var(--color-sage)" strokeWidth="0.5"/>
            <line x1="800" y1="50" x2="0" y2="550" stroke="var(--color-sage)" strokeWidth="0.5"/>
            <polygon points="150,80 650,80 650,420 150,420" fill="none" stroke="var(--color-sage)" strokeWidth="1"/>
            <polygon points="180,110 620,110 620,390 180,390" fill="none" stroke="var(--color-sage)" strokeWidth="0.5" strokeDasharray="3 3"/>
            <rect x="250" y="160" width="300" height="180" fill="none" stroke="var(--color-ochre)" strokeWidth="2"/>
            <line x1="250" y1="250" x2="550" y2="250" stroke="var(--color-ochre)" strokeWidth="1" strokeDasharray="5 5"/>
          </svg>

          {/* Corner structural bracket markers */}
          <span className="absolute bottom-12 left-12 font-mono text-xl text-sage/30 select-none">L</span>
          <span className="absolute top-12 right-12 font-mono text-xl text-sage/30 select-none">⏊</span>

          {/* System status readout */}
          <div className="relative z-10 text-right">
            <p className="font-serif italic text-sm text-cream mb-1">
              "To prioritize development is to empower citizens."
            </p>
            <span className="font-mono text-[9px] text-sage/50 uppercase tracking-widest">
              District Intake Assembly Protocol
            </span>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="h-16 bg-navy border-t border-sage/15 px-8 flex items-center justify-between font-mono text-[10px] text-sage/50 select-none shrink-0">
        <span>© 2026 INFRASTRUCTURAL AUTHORITY. PERMANENT RECORD SYSTEM.</span>
        <div className="flex space-x-6">
          <button onClick={() => setView("SETTINGS")} className="hover:text-cream transition-colors">Privacy Protocol</button>
          <button onClick={() => setView("LEDGER")} className="hover:text-cream transition-colors">Public Ledger</button>
          <button onClick={() => setView("SETTINGS")} className="hover:text-cream transition-colors">Accessibility</button>
        </div>
      </footer>
    </div>
  );
}
