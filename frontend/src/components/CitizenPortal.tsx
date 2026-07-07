import React, { useState, useEffect, useRef } from "react";
import { 
  User as UserIcon, 
  MapPin, 
  Send, 
  Award, 
  Clock, 
  Volume2, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Mic, 
  MicOff, 
  Camera, 
  Wifi, 
  WifiOff, 
  Globe, 
  Sparkles, 
  ThumbsUp, 
  MessageSquare, 
  X, 
  Map, 
  Shield, 
  HelpCircle, 
  ListOrdered,
  PlusCircle,
  Play
} from "lucide-react";
import L from "leaflet";
import { User, LedgerItem } from "../types";
import VoiceRecorder from "./VoiceRecorder";
import BloomCard from "./BloomCard";
import AISuggestionCard from "./AISuggestionCard";
import { motion } from "motion/react";


interface CitizenPortalProps {
  currentUser: User;
  onLogout: () => void;
  activeTab: "dashboard" | "map" | "report" | "polling" | "announcements";
  setActiveTab: (tab: "dashboard" | "map" | "report" | "polling" | "announcements") => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome back",
    reportIssueTitle: "Submit Local Issue Feedback",
    myEngagement: "My Engagement Deck",
    reportNewIssue: "Report New Issue",
    announcements: "MP Announcements",
    proposalsMap: "Proposals Near Me",
    competingPriority: "Priority Polling",
    districtRep: "District Representative",
    engagementScore: "Engagement Score",
    underReview: "Under Review",
    accepted: "Accepted",
    implemented: "Implemented",
    firstResponder: "First Responder",
    auditEndorser: "Audit Endorser",
    neighborhoodWatch: "Neighborhood Watch",
    submitLedger: "Submit to Ledger",
    filingFeedback: "Filing Feedback...",
    voiceIntake: "Voice Intake (Hindi / Regional)",
    photoUpload: "Geotagged Photo",
    gpsCapture: "GPS Geotag Capture",
    whatsappSim: "WhatsApp Chatbot Bot",
    offlineQueue: "Offline Sync Queue",
    competingProjects: "Prioritize Competing Projects",
    comments: "Comments",
    addComment: "Post Comment",
    upvote: "Verify / Upvote",
    online: "Online Mode",
    offline: "Offline Mode",
    myIssues: "My Submitted Issues",
    badges: "My Civic Badges",
    leaderboard: "Constituency Leaderboard",
    verifiedStatus: "Verification Status",
    timelineStatus: "Timeline Progress",
    postSuccess: "Thank you! Your feedback has been registered.",
    offlineSuccess: "Submissions saved to offline queue. Switch to Online mode to sync.",
    simulatingVoice: "Simulating speech-to-text transcription...",
    stopDictation: "Stop Dictation & Translate"
  },
  hi: {
    welcome: "Swagat hai",
    reportIssueTitle: "Sthaniya Samasya Darj Karen",
    myEngagement: "Bhagidari Deck",
    reportNewIssue: "Nayi Samasya Report Karen",
    announcements: "Sansad Ghoshnayein",
    proposalsMap: "Mere Aaspas Ke Prastav",
    competingPriority: "Prathmikta Matdan",
    districtRep: "Jila Pratinidhi",
    engagementScore: "Bhagidari Score",
    underReview: "Sameeksha Ke Adheen",
    accepted: "Sweekrit",
    implemented: "Lagoo Kiya Gaya",
    firstResponder: "Pratham Uttaradata",
    auditEndorser: "Audit Samarthak",
    neighborhoodWatch: "Neighborhood Watch",
    submitLedger: "Ledger Mein Jama Karen",
    filingFeedback: "Darj Kiya Ja Raha Hai...",
    voiceIntake: "Awaaz Intake (Hindi / Regional)",
    photoUpload: "Geotagged Photo",
    gpsCapture: "GPS Geotag Capture",
    whatsappSim: "WhatsApp Chatbot",
    offlineQueue: "Offline Sync Queue",
    competingProjects: "Pariyojnaon Ko Prathmikta Dein",
    comments: "Tippaniyan",
    addComment: "Tippani Post Karen",
    upvote: "Satyapit Karen / Vote Dein",
    online: "Online Mode",
    offline: "Offline Mode",
    myIssues: "Mere Dwara Prastut Mudde",
    badges: "Mere Nagrik Badge",
    leaderboard: "Nirvachan Kshetra Leaderboard",
    verifiedStatus: "Satyapan Sthiti",
    timelineStatus: "Samayrekha Pragati",
    postSuccess: "Dhanyawad! Aapki pratikriya panjeekrit kar li gayi hai.",
    offlineSuccess: "Pratikriya offline queue mein saheji gayi. Sync karne ke liye online mode chalu karen.",
    simulatingVoice: "Awaaz se paath anuvad simulate kiya ja raha hai...",
    stopDictation: "Dictation roken aur anuvad karen"
  },
  kn: {
    welcome: "Swagata",
    reportIssueTitle: "Sthaleya Samasye Sallisi",
    myEngagement: "Nanna Sahabhagitwada Deck",
    reportNewIssue: "Hosa Samasye Varadi Madi",
    announcements: "Samsadara Prakatanegalu",
    proposalsMap: "Nanna Hattirada Prastapagalu",
    competingPriority: "Adyateya Matadana",
    districtRep: "Jilla Pratinidhi",
    engagementScore: "Sahabhagitwa Score",
    underReview: "Parishilaneyallide",
    accepted: "Angeekarislagide",
    implemented: "Anusthanagolisalagide",
    firstResponder: "Modala Pratikriyegara",
    auditEndorser: "Lekkaparishodhana Bembiliga",
    neighborhoodWatch: "Nerehoreya Kavalu",
    submitLedger: "Ledger-ge Sallisi",
    filingFeedback: "Sallislaguttide...",
    voiceIntake: "Dhwani Intake (Regional)",
    photoUpload: "Geotagged Photo",
    gpsCapture: "GPS Geotag Capture",
    whatsappSim: "WhatsApp Chatbot",
    offlineQueue: "Offline Sync Queue",
    competingProjects: "Yojanegalige Adyate Needi",
    comments: "Comments",
    addComment: "Comment Post Madi",
    upvote: "Parishilisi / Vote Madi",
    online: "Online Mode",
    offline: "Offline Mode",
    myIssues: "Nanna Sallisida Samasyegalu",
    badges: "Nanna Nagrika Badges",
    leaderboard: "Kshetra Leaderboard",
    verifiedStatus: "Parishilana Sthiti",
    timelineStatus: "Pragati Kalavadhi",
    postSuccess: "Dhanyavadagalu! Nimmma pratikriyeyannu nondayisalagide.",
    offlineSuccess: "Sallsuvikyannu offline-nalli ulisalagide. Sync madalu online madi.",
    simulatingVoice: "Dhwaniyinda patyakke parivartaneyannu anukarislaguttide...",
    stopDictation: "Dictation nillisi mattu anuvadisi"
  },
  mr: {
    welcome: "Swagat Aahe",
    reportIssueTitle: "Sthaniya Takrar Submit Kara",
    myEngagement: "Majhi Bhagidari Deck",
    reportNewIssue: "Naveen Takrar Nondva",
    announcements: "Khasdar Ghoshana",
    proposalsMap: "Majhya Javalil Prastav",
    competingPriority: "Pradhanya Matdan",
    districtRep: "Jilha Pratinidhi",
    engagementScore: "Bhagidari Score",
    underReview: "Punaravlokanadheen",
    accepted: "Manjoor",
    implemented: "Amalat Anlele",
    firstResponder: "Pratham Pratisadakarta",
    auditEndorser: "Audit Samarthak",
    neighborhoodWatch: "Neighborhood Watch",
    submitLedger: "Ledger Madhye Submit Kara",
    filingFeedback: "Nondani Hot Aahe...",
    voiceIntake: "Awaaz Intake (Hindi / Regional)",
    photoUpload: "Geotagged Photo",
    gpsCapture: "GPS Geotag Capture",
    whatsappSim: "WhatsApp Chatbot",
    offlineQueue: "Offline Sync Queue",
    competingProjects: "Prakalpanna Pradhanya Dya",
    comments: "Tippanya",
    addComment: "Tippani Post Kara",
    upvote: "Satyapit Kara / Like Kara",
    online: "Online Mode",
    offline: "Offline Mode",
    myIssues: "Majhya Sadar Kelelya Takrari",
    badges: "Majhe Nagri Badges",
    leaderboard: "Matdarsangh Leaderboard",
    verifiedStatus: "Padtalani Sthiti",
    timelineStatus: "Timeline Pragati",
    postSuccess: "Dhanyawad! Tumchi takrar nondvali geli aahe.",
    offlineSuccess: "Takrar offline jatan keli. Sync karnyasaathi online mode chalu kara.",
    simulatingVoice: "Awaaz-te-mazkoor rupantaran simulate karat aahe...",
    stopDictation: "Dictation thambva aani bhashantar kara"
  },
  ta: {
    welcome: "Nalvaravu",
    reportIssueTitle: "Ullur Kuraigalai Samarpikkavum",
    myEngagement: "Enathu Pangalippu Deck",
    reportNewIssue: "Puthiya Pugar Pathivu Seiga",
    announcements: "MP Arivippugal",
    proposalsMap: "Enakku Arugilulla Thithangal",
    competingPriority: "Munnurimai Vakokeduppu",
    districtRep: "Mavatta Prathinithi",
    engagementScore: "Pangalippu Mathipenn",
    underReview: "Mathipayvil Ullathu",
    accepted: "Erkappattathu",
    implemented: "Seyalpadduthappattathu",
    firstResponder: "Mudhal Pathilalippavar",
    auditEndorser: "Thanikkai Aadharavalavur",
    neighborhoodWatch: "Andai Kankanippu",
    submitLedger: "Ledgeril Samarpikkavum",
    filingFeedback: "Pathivu Seyyappadukirathu...",
    voiceIntake: "Kural Pathivu (Regional)",
    photoUpload: "Geotagged Photo",
    gpsCapture: "GPS Geotag Capture",
    whatsappSim: "WhatsApp Chatbot",
    offlineQueue: "Offline Sync Queue",
    competingProjects: "Thithangalukku Munnurimai Kodungangal",
    comments: "Karuthugal",
    addComment: "Karuthu Idugaiyidavum",
    upvote: "Saripar / Vakkali",
    online: "Online Mode",
    offline: "Offline Mode",
    myIssues: "Enathu Samarpitha Pugarghal",
    badges: "Enathu Kudimai Badges",
    leaderboard: "Thoguthi Leaderboard",
    verifiedStatus: "Sariparppu Nilai",
    timelineStatus: "Kalavarisai Munnerram",
    postSuccess: "Nandri! Ungal pugar pathivu seyyappattullathu.",
    offlineSuccess: "Pugar offline-il semikkappattathu. Sync seyya online-ai iyakkavum.",
    simulatingVoice: "Kuralilirundhu uraikku molhipeyarthal anukarikkappadugirathu...",
    stopDictation: "Pathivai niruthi molhipeyarkkavum"
  }
};

export default function CitizenPortal({ 
  currentUser, 
  onLogout,
  activeTab,
  setActiveTab
}: CitizenPortalProps) {
  const [chosenLang, setChosenLang] = useState<"en" | "hi" | "kn" | "mr" | "ta">("en");
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState<any>(null);
  
  // Real Network connectivity state (Toggleable)
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem("offline_submissions_queue") || "[]");
  });
  const [isSyncing, setIsSyncing] = useState(false);
  // Intake Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("roads");
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  // Submissions & Map details
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  // Image upload simulation
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");

  // AI pipeline screen overlay
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProcessingStep, setAiProcessingStep] = useState(0);
  const [lastAiResult, setLastAiResult] = useState<any | null>(null);

  // WhatsApp simulation state
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappChat, setWhatsappChat] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    { sender: "bot", text: "Namaste! Welcome to the People's Priorities WhatsApp Assistant. Send me a voice note or type any local infrastructure issue in your own words. ðŸ‡®ðŸ‡³", time: "Just now" }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [usedVoice, setUsedVoice] = useState(false);
  const [isWhatsappRecording, setIsWhatsappRecording] = useState(false);

  // Conversational Submission Agent States
  const [submissionMode, setSubmissionMode] = useState<"guided" | "standard">("guided");
  const [convoHistory, setConvoHistory] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    { sender: "bot", text: "Namaste! I am your AI Submission Assistant. Tell me, what local infrastructure or public utility issue would you like to report today? (You can type in English, Hindi, Kannada, Tamil, or Marathi)." }
  ]);
  const [convoInput, setConvoInput] = useState("");
  const [convoLoading, setConvoLoading] = useState(false);
  const [convoComplete, setConvoComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Proactive Duplicate-Check States
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [duplicateChecking, setDuplicateChecking] = useState(false);
  const [pendingItemToSubmit, setPendingItemToSubmit] = useState<any | null>(null);

  // Natural-Language Status Agent States
  const [statusProposalId, setStatusProposalId] = useState("");
  const [statusChatHistory, setStatusChatHistory] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    { sender: "bot", text: "Hello! Select one of your submitted complaints from the dropdown above, and ask me anything about its current progress, history, or next steps." }
  ]);
  const [statusInput, setStatusInput] = useState("");
  const [statusChatLoading, setStatusChatLoading] = useState(false);

  const t = translations[chosenLang];

  const handleConvoSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convoInput.trim()) return;

    const userMsg = convoInput;
    const updatedHistory = [...convoHistory, { sender: "user" as const, text: userMsg }];
    setConvoHistory(updatedHistory);
    setConvoInput("");
    setConvoLoading(true);

    try {
      const res = await fetch("/api/ai/conversational-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_history: updatedHistory,
          user_message: userMsg
        })
      });
      if (res.ok) {
        const data = await res.json();
        setConvoHistory(prev => [...prev, { sender: "bot" as const, text: data.response_text }]);
        
        if (data.is_complete && data.extracted_data) {
          setConvoComplete(true);
          setExtractedData(data.extracted_data);
          
          setTitle(data.extracted_data.title || "AI Report");
          setDescription(data.extracted_data.description || "");
          setCategory(data.extracted_data.category || "roads");
        }
      }
    } catch (err) {
      console.error("Error in conversational submission:", err);
      setConvoHistory(prev => [...prev, { sender: "bot" as const, text: "I'm having some trouble processing that right now. Could you please check your internet connection?" }]);
    } finally {
      setConvoLoading(false);
    }
  };

  const handleConfirmDifferent = async () => {
    if (pendingItemToSubmit) {
      setDuplicateWarning(null);
      await submitOnlineItem(pendingItemToSubmit);
      setPendingItemToSubmit(null);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (duplicateWarning && duplicateWarning.duplicate_suggestion_id) {
      const dupId = duplicateWarning.duplicate_suggestion_id;
      setDuplicateWarning(null);
      setPendingItemToSubmit(null);
      await handleUpvote(dupId);
      setActiveTab("dashboard");
    }
  };

  const handleStatusSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusInput.trim() || !statusProposalId) return;

    const userMsg = statusInput;
    const updatedHistory = [...statusChatHistory, { sender: "user" as const, text: userMsg }];
    setStatusChatHistory(updatedHistory);
    setStatusInput("");
    setStatusChatLoading(true);

    try {
      const res = await fetch("/api/ai/status-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg,
          proposal_id: statusProposalId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStatusChatHistory(prev => [...prev, { sender: "bot" as const, text: data.response }]);
      }
    } catch (err) {
      console.error("Status chat error:", err);
    } finally {
      setStatusChatLoading(false);
    }
  };

  // Leaflet map hooks
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userPinMarkerRef = useRef<L.Marker | null>(null);

  // Sync offline queue to localStorage
  useEffect(() => {
    localStorage.setItem("offline_submissions_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);



  // Sync dashboard data
  async function fetchCitizenDashboard() {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/user/dashboard", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Sync name/email
        if (currentUser) {
          data.user.profile.name = currentUser.name;
          data.user.profile.email = currentUser.email;
          data.user.profile.avatarUrl = currentUser.avatarUrl || data.user.profile.avatarUrl;
        }
        setPortalData(data);
      }
    } catch (err) {
      console.error("Failed to load citizen portal data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Sync all proposals in constituency for the map/polling
  async function fetchAllConstituencyProposals() {
    try {
      const token = localStorage.getItem("auth_token");
      const cId = currentUser.districtId || "74-B";
      const res = await fetch(`/api/proposals?constituency_id=${cId}`, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAllProposals(data);
      }
    } catch (err) {
      console.error("Failed to fetch constituency proposals:", err);
    }
  }

  useEffect(() => {
    fetchCitizenDashboard();
    fetchAllConstituencyProposals();
  }, [currentUser]);

  // Handle Offline -> Online sync trigger
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineSubmissions();
    }
  }, [isOnline]);

  const syncOfflineSubmissions = async () => {
    setIsSyncing(true);
    const queue = [...offlineQueue];
    for (const item of queue) {
      try {
        await submitOnlineItem(item);
        // Remove from state queue
        setOfflineQueue(prev => prev.filter(q => q.id !== item.id));
      } catch (err) {
        console.error("Failed to sync offline item:", err);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    setIsSyncing(false);
  };

  const getBrowserGPS = () => {
    setGpsLoading(true);
    setGpsSuccess(false);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        console.log(`GPS Location fetched successfully with accuracy: ${accuracy} meters.`);
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsSuccess(true);
        setGpsLoading(false);

        // Update the Leaflet marker & view on map if initialized
        if (userPinMarkerRef.current && mapInstance.current) {
          const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
          userPinMarkerRef.current.setLatLng(latlng);
          mapInstance.current.setView(latlng, 17);
        }
      },
      (error) => {
        console.warn("GPS fetching failed, falling back to constituency defaults", error);
        alert("GPS capture failed. Please make sure location permissions are enabled and try again.");
        setGpsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In conversational mode, make sure we use extracted data if not manually modified
    const currentTitle = convoComplete && extractedData ? extractedData.title : title;
    const currentDesc = convoComplete && extractedData ? extractedData.description : description;
    const currentCat = convoComplete && extractedData ? extractedData.category : category;

    const item = {
      title: currentTitle,
      description: currentDesc,
      category: currentCat,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      submission_channel: usedVoice ? "voice" : "text",
      input_language: chosenLang,
      is_suggestion: true,
      imagePrompt: selectedImage ? imagePrompt : undefined
    };

    if (!isOnline) {
      const tempId = `TEMP-${Math.floor(1000 + Math.random() * 9000)}`;
      setOfflineQueue(prev => [...prev, { ...item, id: tempId, timestamp: new Date().toISOString() }]);
      setSubmitSuccess(true);
      setTitle("");
      setDescription("");
      setSelectedImage(null);
      setImagePrompt("");
      setConvoComplete(false);
      return;
    }

    // Proactive Duplicate Check Intercept
    setDuplicateChecking(true);
    try {
      const dupRes = await fetch("/api/ai/duplicate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (dupRes.ok) {
        const dupData = await dupRes.json();
        if (dupData.has_duplicates) {
          setDuplicateWarning(dupData);
          setPendingItemToSubmit(item);
          setDuplicateChecking(false);
          return; // Wait for user confirmation
        }
      }
    } catch (err) {
      console.error("Duplicate check failed:", err);
    }
    setDuplicateChecking(false);

    await submitOnlineItem(item);
  };

  const submitOnlineItem = async (item: any) => {
    setSubmitLoading(true);
    setSubmitSuccess(false);
    setIsProcessingAI(true);
    setAiProcessingStep(0);

    const steps = [
      "Translating input using Gemini NLP...",
      "Extracting category & tagging geolocation...",
      "Detecting duplicate claims in Ward database...",
      "Matching demographic indices & ward priorities...",
      "Running ranking algorithm & computing demand score..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiProcessingStep(i);
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/ledger/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: `${item.title}: ${item.description}`,
          type: item.submission_channel || "text",
          imagePrompt: item.imagePrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Calculate breakdown details
        const score = data.item.priorityLevel === 'CRITICAL' ? 91 : data.item.priorityLevel === 'ELEVATED' ? 76 : 58;
        setLastAiResult({
          title: data.item.title,
          theme: data.item.theme,
          priorityLevel: data.item.priorityLevel,
          demand_score: score,
          demand_score_breakdown: {
            complaint_count: 1,
            severity_weighted_score: data.item.priorityLevel === 'CRITICAL' ? 95 : 68,
            population_density_factor: 72,
            duplicate_count: 0,
            historical_neglect_factor: 80
          },
          demographic_overlay: {
            population: 18200,
            literacy_rate: 82.5,
            avg_income_bracket: "Low-Medium"
          }
        });

        setSubmitSuccess(true);
        setTitle("");
        setDescription("");
        setSelectedImage(null);
        setImagePrompt("");
        setUsedVoice(false);
        
        await fetchCitizenDashboard();
        await fetchAllConstituencyProposals();
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsProcessingAI(false);
      setSubmitLoading(false);
    }
  };

  // Upvote / Verify suggestion
  const handleUpvote = async (proposalId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/user/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ suggestion_id: proposalId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        
        // Refresh states
        await fetchCitizenDashboard();
        await fetchAllConstituencyProposals();
        
        // Update selected proposal if active
        if (selectedProposal && selectedProposal.proposal_id === proposalId) {
          const updated = allProposals.find(p => p.proposal_id === proposalId);
          if (updated) {
            setSelectedProposal({
              ...selectedProposal,
              demand_score: data.supported ? selectedProposal.demand_score + 2 : selectedProposal.demand_score - 2,
              demand_score_breakdown: {
                ...selectedProposal.demand_score_breakdown,
                complaint_count: data.supported ? selectedProposal.demand_score_breakdown.complaint_count + 1 : selectedProposal.demand_score_breakdown.complaint_count - 1
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("Upvoting failed:", err);
    }
  };

  // Comment on Suggestion
  const handlePostComment = async (e: React.FormEvent, proposalId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setSubmittingComment(true);

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/user/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          suggestion_id: proposalId,
          comment: newCommentText
        })
      });

      if (res.ok) {
        setNewCommentText("");
        alert("Comment added successfully!");
        
        // Re-fetch proposal timeline
        const auditRes = await fetch(`/api/proposals/${proposalId}/audit-trail`, {
          headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
        });
        if (auditRes.ok) {
          const auditLogs = await auditRes.json();
          setSelectedProposal((prev: any) => ({
            ...prev,
            statusTimeline: auditLogs.map((log: any) => ({
              status: log.action.toUpperCase(),
              timestamp: log.created_at,
              notes: log.comment
            }))
          }));
        }
        await fetchCitizenDashboard();
      }
    } catch (err) {
      console.error("Posting comment failed:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Competing Proposal Priority Poll Vote
  const handlePriorityPollVote = async (proposalId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/user/priority-poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ suggestion_id: proposalId })
      });
      if (res.ok) {
        alert("Your priority vote has been registered! You earned +10 Engagement Points.");
        await fetchCitizenDashboard();
        await fetchAllConstituencyProposals();
      }
    } catch (err) {
      console.error("Priority vote failed:", err);
    }
  };



  // WhatsApp simulation submission
  const sendWhatsappMessage = async () => {
    if (!whatsappMessage.trim()) return;
    const msg = whatsappMessage;
    setWhatsappChat(prev => [...prev, { sender: "user", text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setWhatsappMessage("");
    setIsBotTyping(true);

    // Call API submit
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/ledger/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: msg,
          type: "whatsapp"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setIsBotTyping(false);
          setWhatsappChat(prev => [...prev, {
            sender: "bot",
            text: `âœ… Thank you! Gemini AI parsed this issue as category: *${data.item.theme}* (Priority: *${data.item.priorityLevel}*).\nIt has been logged to the public ledger with ID *${data.item.id}*.\n\nYou can track its progress or verify it in the Citizen Portal.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          fetchCitizenDashboard();
          fetchAllConstituencyProposals();
        }, 1500);
      }
    } catch (err) {
      setIsBotTyping(false);
      console.error(err);
    }
  };

  // Leaflet map initialization
  useEffect(() => {
    if (activeTab !== "map" || !mapRef.current) {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      return;
    }

    const map = L.map(mapRef.current).setView([12.9716, 77.5946], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstance.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Map click to set custom marker (GPS pin fallback)
    map.on("click", (e) => {
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      if (userPinMarkerRef.current) {
        userPinMarkerRef.current.setLatLng(e.latlng);
      } else {
        userPinMarkerRef.current = L.marker(e.latlng, {
          draggable: true,
          icon: L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })
        }).addTo(map);
        userPinMarkerRef.current.on("dragend", () => {
          const latlng = userPinMarkerRef.current?.getLatLng();
          if (latlng) {
            setCoordinates({ lat: latlng.lat, lng: latlng.lng });
          }
        });
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeTab]);

  // Update proposal pins on map
  useEffect(() => {
    if (!mapInstance.current || !markersGroupRef.current || allProposals.length === 0) return;

    markersGroupRef.current.clearLayers();

    allProposals.forEach((p) => {
      const lat = parseFloat(p.latitude) || 12.97 + (Math.random() - 0.5) * 0.05;
      const lng = parseFloat(p.longitude) || 77.59 + (Math.random() - 0.5) * 0.05;

      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      });

      marker.on("click", async () => {
        // Fetch audit logs for detailed status timeline
        const token = localStorage.getItem("auth_token");
        let timeline = [
          { status: "SUBMITTED", timestamp: p.created_at, notes: "Civic record entered." }
        ];

        try {
          const auditRes = await fetch(`/api/proposals/${p.proposal_id}/audit-trail`, {
            headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
          });
          if (auditRes.ok) {
            const auditLogs = await auditRes.json();
            timeline = auditLogs.map((log: any) => ({
              status: log.action.toUpperCase(),
              timestamp: log.created_at,
              notes: log.comment
            }));
          }
        } catch (err) {
          console.error(err);
        }

        setSelectedProposal({
          ...p,
          statusTimeline: timeline
        });
      });

      marker.addTo(markersGroupRef.current!);
    });

    // Auto fit bounds if coordinates exist
    if (allProposals.length > 0) {
      const group = L.featureGroup(allProposals.map(p => L.marker([parseFloat(p.latitude) || 12.97, parseFloat(p.longitude) || 77.59])));
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [allProposals, activeTab]);

  if (loading || !portalData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-xs font-mono tracking-widest text-slate-500 uppercase">Loading Citizens Assembly Portal...</p>
      </div>
    );
  }

  const { user, metrics, submissions, aiInsights, constituencyUpdates } = portalData;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-850 font-sans">
      
      {/* Citizen Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full shadow-sm">
        <div>
          {/* Top Logo / Profile section */}
          <div className="p-6 flex items-center space-x-3 border-b border-slate-150 bg-slate-50/50">
            <div className="w-12 h-12 rounded overflow-hidden border-2 border-indigo-200 flex items-center justify-center bg-indigo-50 font-serif font-bold text-indigo-650 text-base shadow-inner shrink-0">
              {user.profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif font-bold text-sm tracking-tight text-slate-900 truncate">
                {user.profile.name}
              </h2>
              <span className="inline-block text-[8px] uppercase px-1.5 py-0.5 rounded leading-none mt-1 font-mono font-bold bg-indigo-50 border border-indigo-150 text-indigo-750">
                CITIZEN
              </span>
            </div>
          </div>

          {/* Quick Rep Info badge */}
          <div className="mx-4 my-4 p-3 bg-slate-50/50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-650 text-xs shrink-0">
                {user.constituency.representative.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-slate-800 truncate">{user.constituency.representative}</h4>
                <p className="text-[8px] text-slate-505 font-mono">District Rep (MP)</p>
              </div>
            </div>
          </div>

          {/* Menu Items list */}
          <nav className="px-3 space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer text-left border ${
                activeTab === "dashboard"
                  ? "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650 border-y border-r border-slate-200"
                  : "bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 border-transparent"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{t.myEngagement}</span>
            </button>

            <button
              onClick={() => setActiveTab("report")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer text-left border ${
                activeTab === "report"
                  ? "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650 border-y border-r border-slate-200"
                  : "bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 border-transparent"
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{t.reportNewIssue}</span>
            </button>

            <button
              onClick={() => setActiveTab("status_chat" as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer text-left border ${
                activeTab === ("status_chat" as any)
                  ? "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650 border-y border-r border-slate-200"
                  : "bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>Status Chat Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer text-left border ${
                activeTab === "map"
                  ? "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650 border-y border-r border-slate-200"
                  : "bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 border-transparent"
              }`}
            >
              <Map className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{t.proposalsMap}</span>
            </button>

            <button
              onClick={() => setActiveTab("polling")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer text-left border ${
                activeTab === "polling"
                  ? "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650 border-y border-r border-slate-200"
                  : "bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 border-transparent"
              }`}
            >
              <ListOrdered className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{t.competingPriority}</span>
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer text-left border ${
                activeTab === "announcements"
                  ? "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650 border-y border-r border-slate-200"
                  : "bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 border-transparent"
              }`}
            >
              <Volume2 className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>{t.announcements}</span>
            </button>
          </nav>
        </div>

        {/* Bottom controls panel */}
        <div className="p-4 border-t border-slate-150 bg-slate-50 space-y-3 shrink-0">
          {/* Connection state banner */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all border ${
              isOnline 
                ? "bg-emerald-50 border-emerald-250 text-emerald-700 font-bold" 
                : "bg-rose-50 border-rose-250 text-rose-700 font-bold"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>ONLINE MODE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>OFFLINE MODE</span>
              </>
            )}
          </button>

          {/* Language selection dropdown */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs">
            <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <select 
              value={chosenLang}
              onChange={(e) => setChosenLang(e.target.value as any)}
              className="w-full bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer font-sans"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
              <option value="mr">Marathi</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-slate-600 text-xs font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col overflow-hidden h-full bg-slate-50">
        {/* Top Header inside main view */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur px-6 md:px-8 py-5 shadow-sm shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <span className="flex items-center text-xs text-slate-500 font-mono">
                <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
                {user.constituency.name} Constituency Assembly Portal
              </span>
              <h1 className="text-xl font-bold font-serif text-slate-900 tracking-wide mt-1">
                Citizen Civic Intake Console
              </h1>
            </div>
            
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-mono text-slate-505 block uppercase tracking-wider">Engagement Level</span>
              <span className="font-bold text-sm text-indigo-650">{user.participationStats.engagementScore} Points</span>
            </div>
          </div>
        </header>

        {/* Syncing notification bar */}
        {isSyncing && (
          <div className="bg-indigo-650 text-white text-center py-2 text-xs font-mono flex items-center justify-center space-x-2 animate-pulse shrink-0">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-b border-white"></div>
            <span>Synchronizing offline submissions queue to Neon DB ledger...</span>
          </div>
        )}

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Civic Nudge Agent Widget */}
              {portalData?.civicNudge && (
                <AISuggestionCard badgeText="Weekly Civic Action Nudge" className="mb-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <p className="font-semibold text-slate-800 text-xs">
                      {portalData.civicNudge.message}
                    </p>
                    {portalData.civicNudge.suggested_proposal_id && (
                      <button
                        onClick={async () => {
                          const pId = portalData.civicNudge.suggested_proposal_id;
                          const found = allProposals.find(p => p.proposal_id === pId);
                          if (found) {
                            setSelectedProposal(found);
                            setActiveTab("map");
                          } else {
                            alert("Selected proposal coordinates matched. Check map view.");
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#6C5CE7] hover:bg-[#5b4dbf] text-white rounded font-mono text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                      >
                        Action Needed &rarr;
                      </button>
                    )}
                  </div>
                </AISuggestionCard>
              )}
              
              {/* Engagement metrics & stats row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center flex flex-col justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">{t.engagementScore}</span>
                  <span className="font-serif text-3xl font-bold text-indigo-600">{user.participationStats.engagementScore}</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(100, user.participationStats.engagementScore)}%` }}></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">{t.underReview}</span>
                  <span className="font-serif text-3xl font-bold text-amber-600">{metrics.suggestionsUnderReview}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Pending validation</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">{t.accepted}</span>
                  <span className="font-serif text-3xl font-bold text-emerald-600">{metrics.suggestionsAccepted}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Scheduled for action</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">{t.implemented}</span>
                  <span className="font-serif text-3xl font-bold text-violet-600">{metrics.suggestionsImplemented}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Resolved issues</span>
                </div>
              </div>

              {/* Grid content: Badges and Submissions */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-4">
                
                {/* My Active Submissions (8 columns) */}
                <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
                  <h3 className="font-serif text-lg font-bold text-slate-800 border-b border-slate-150 pb-3 mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>{t.myIssues}</span>
                  </h3>

                  <div className="space-y-4">
                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 font-mono py-8 text-center">
                        No issues reported yet. Use the "Report New Issue" tab to begin.
                      </p>
                    ) : (
                      submissions.map((sub: any) => (
                        <div key={sub.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-slate-850 leading-tight">{sub.title}</h4>
                              <span className="text-[9px] text-indigo-600 font-mono mt-1 block">{sub.theme}</span>
                            </div>
                            <span className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
                              sub.status === "CLOSED" || sub.status === "COMPLETED" ? "bg-slate-200 text-slate-600 border-slate-300" :
                              sub.status === "IN_PROGRESS" || sub.status === "APPROVED" ? "bg-emerald-50 text-emerald-750 border-emerald-200" :
                              "bg-amber-50 text-amber-750 border-amber-200"
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-650 leading-relaxed font-sans">{sub.description}</p>
                          
                          {/* Simple inline progress bar */}
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[9px] font-mono text-slate-500 block mb-2">{t.timelineStatus}:</span>
                            <div className="flex flex-col md:flex-row justify-between text-[8px] font-mono text-slate-600 gap-2">
                              {sub.statusTimeline.map((step: any, idx: number) => (
                                <div key={idx} className="flex flex-col bg-white p-1.5 rounded border border-slate-200 w-full shadow-sm">
                                  <span className="font-bold text-indigo-650">{step.status}</span>
                                  <span className="text-[7px] text-slate-500">{new Date(step.timestamp).toLocaleDateString()}</span>
                                  <span className="text-[8px] text-slate-650 mt-0.5 leading-tight">{step.notes}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Badges Panel & Leaderboard (4 columns) */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* Badges card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-serif text-base font-bold text-slate-805 border-b border-slate-150 pb-3 mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span>{t.badges}</span>
                    </h3>

                    <div className="space-y-4">
                      {user.participationStats.badges.length === 0 ? (
                        <p className="text-[10px] font-mono text-slate-500">No badges earned yet. Upvote or submit issues to earn achievements.</p>
                      ) : (
                        user.participationStats.badges.map((badge: any) => (
                          <div key={badge.id} className="flex items-start space-x-3 p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <Award className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{badge.name}</h4>
                              <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{badge.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Leaderboard Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-serif text-base font-bold text-slate-800 border-b border-slate-150 pb-3 mb-4 flex items-center space-x-2">
                      <ListOrdered className="w-5 h-5 text-indigo-600" />
                      <span>{t.leaderboard}</span>
                    </h3>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded font-bold text-indigo-850">
                        <span>1. {user.profile.name} (You)</span>
                        <span className="font-mono text-indigo-600">{user.participationStats.engagementScore} pts</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                        <span>2. Rajesh Kumar</span>
                        <span className="font-mono text-slate-500">82 pts</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                        <span>3. Amit Patil</span>
                        <span className="font-mono text-slate-500">65 pts</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                        <span>4. Priya Sharma</span>
                        <span className="font-mono text-slate-500">54 pts</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Proposals Map View Tab */}
          {activeTab === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Leaflet Map (8 columns) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-slate-850 border-b border-slate-150 pb-3 mb-4 flex items-center space-x-2">
                    <Map className="w-5 h-5 text-indigo-600" />
                    <span>{t.proposalsMap}</span>
                  </h3>
                  <div 
                    ref={mapRef} 
                    className="w-full h-[500px] rounded-lg border border-slate-200 overflow-hidden relative z-10"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-2">
                    * Click anywhere on the map to manually set your coordinates for new issue report submissions.
                  </p>
                </div>
              </div>

              {/* Selected Pin Details & Upvote/Comment Sidebar (4 columns) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[560px] flex flex-col justify-between">
                {selectedProposal ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 border-b border-slate-150 pb-3 mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-850 leading-tight">{selectedProposal.title}</h4>
                          <span className="text-[9px] font-mono text-indigo-600 block mt-1">{selectedProposal.category}</span>
                        </div>
                        <span className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                          selectedProposal.status === 'proposed' || selectedProposal.status === 'under_review' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {selectedProposal.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-650 leading-relaxed font-sans">{selectedProposal.description}</p>
                      
                      <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Demand Score:</span>
                          <span className="font-bold text-indigo-650">{selectedProposal.demand_score} / 100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Upvotes / Signatures:</span>
                          <span className="font-bold text-slate-800">{selectedProposal.demand_score_breakdown?.complaint_count || 1}</span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-4">
                        <span className="text-[10px] font-mono text-slate-500 block mb-2">{t.timelineStatus}:</span>
                        <div className="space-y-2">
                          {selectedProposal.statusTimeline?.map((step: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded text-[10px] font-sans">
                              <div className="flex justify-between font-bold text-indigo-650">
                                <span>{step.status}</span>
                                <span className="text-slate-500 font-mono">{new Date(step.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-650 mt-1 leading-snug">{step.notes}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Voting/Verification & Comments Actions */}
                    <div className="pt-4 border-t border-slate-250 mt-4 space-y-3">
                      <button
                        onClick={() => handleUpvote(selectedProposal.proposal_id || selectedProposal.db_id)}
                        className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{t.upvote}</span>
                      </button>

                      {/* Comments list inside popup */}
                      <form onSubmit={(e) => handlePostComment(e, selectedProposal.proposal_id || selectedProposal.db_id)} className="space-y-2 mt-2">
                        <textarea
                          rows={2}
                          required
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Add citizen comments to enrich AI context..."
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-600 font-sans"
                        />
                        <button
                          type="submit"
                          disabled={submittingComment}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[10px] uppercase rounded"
                        >
                          {submittingComment ? "Posting..." : t.addComment}
                        </button>
                      </form>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400 h-full p-8">
                    <MapPin className="w-10 h-10 text-slate-350 mb-2" />
                    <p className="text-xs font-mono">Select a violet proposal pin on the map to verify, view timeline details, or comment.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Report New Issue Tab */}
          {activeTab === "report" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Input (8 columns) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-slate-850 border-b border-slate-150 pb-4 mb-6 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <PlusCircle className="w-5.5 h-5.5 text-indigo-600" />
                    <span>{t.reportIssueTitle}</span>
                  </span>
                  
                  {/* Sync status */}
                  {offlineQueue.length > 0 && (
                    <span className="bg-amber-50 border border-amber-250 text-amber-700 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                      {offlineQueue.length} Pending Offline
                    </span>
                  )}
                </h3>

                {duplicateWarning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-5 border border-amber-250 bg-[#FFFBEB] rounded-xl text-xs space-y-4 text-black"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-900 text-sm">Proactive Duplicate Warning</h4>
                        <p className="text-amber-800 mt-1">{duplicateWarning.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pl-8">
                      <button
                        type="button"
                        onClick={handleConfirmDuplicate}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg uppercase text-[10px] cursor-pointer"
                      >
                        Yes, verify & upvote existing
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDifferent}
                        className="px-4 py-2 border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold rounded-lg uppercase text-[10px] cursor-pointer"
                      >
                        No, this is a different issue
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex bg-slate-100 p-1 rounded-lg w-full max-w-sm mb-6 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSubmissionMode("guided")}
                    className={`w-1/2 text-center py-1.5 text-xs font-bold uppercase rounded-md tracking-wide cursor-pointer transition-all ${
                      submissionMode === "guided" ? "bg-white text-indigo-750 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    AI Guided Assistant
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionMode("standard")}
                    className={`w-1/2 text-center py-1.5 text-xs font-bold uppercase rounded-md tracking-wide cursor-pointer transition-all ${
                      submissionMode === "standard" ? "bg-white text-indigo-750 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Standard Form
                  </button>
                </div>

                {submissionMode === "guided" ? (
                  <div className="space-y-4 text-black">
                    {/* Guided Conversational Chat Box */}
                    <div className="border border-slate-250 rounded-xl overflow-hidden flex flex-col justify-between h-[360px] bg-slate-50/50">
                      {/* Chat messages */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-sans">
                        {convoHistory.map((chat, idx) => (
                          <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2.5 rounded-xl shadow-sm leading-relaxed ${
                              chat.sender === 'user'
                                ? 'bg-indigo-650 border border-indigo-700 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 rounded-tl-none text-slate-800'
                            }`}>
                              {chat.text}
                            </div>
                          </div>
                        ))}
                        {convoLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 p-2.5 rounded-xl rounded-tl-none text-[10px] text-slate-500 animate-pulse font-mono shadow-sm">
                              Submission Agent is analyzing...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input form */}
                      {!convoComplete ? (
                        <form onSubmit={handleConvoSend} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
                          <input
                            type="text"
                            value={convoInput}
                            onChange={(e) => setConvoInput(e.target.value)}
                            placeholder="Type details about your issue here..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-850 outline-none focus:border-indigo-650 font-sans"
                            disabled={convoLoading}
                          />
                          <button
                            type="submit"
                            disabled={convoLoading || !convoInput.trim()}
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-all"
                          >
                            Send
                          </button>
                        </form>
                      ) : (
                        <div className="p-3 border-t border-slate-200 bg-[#E8F5E9] text-[#2E7D32] text-xs font-medium text-center">
                          🎉 Conversation Complete! Verify parameters below to submit.
                        </div>
                      )}
                    </div>

                    {/* Extracted results display */}
                    {convoComplete && extractedData && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-white border border-emerald-250 rounded-xl space-y-4 text-xs shadow-sm"
                      >
                        <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">AI Extracted Parameters</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-bold text-slate-500 block uppercase text-[10px]">Extracted Title</span>
                            <span className="text-slate-800 text-xs font-semibold">{extractedData.title}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 block uppercase text-[10px]">Inferred Category</span>
                            <span className="text-slate-800 text-xs font-semibold capitalize">{extractedData.category}</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-bold text-slate-500 block uppercase text-[10px]">Compiled Description</span>
                          <p className="text-slate-700">{extractedData.description}</p>
                        </div>

                        {/* Location picker and photo upload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-500 block uppercase text-[10px]">Location Coords</span>
                            <div className="flex space-x-1.5">
                              <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-600 flex items-center">
                                {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                              </div>
                              <button
                                type="button"
                                onClick={getBrowserGPS}
                                className="px-2.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Get GPS</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold text-slate-500 block uppercase text-[10px]">Photo Upload</span>
                            {selectedImage ? (
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[10px]">
                                <span className="truncate text-slate-700">photo_damage_log.jpg</span>
                                <button type="button" onClick={() => { setSelectedImage(null); }} className="text-rose-500 font-bold">Remove</button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedImage("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=200");
                                  setImagePrompt("Pothole crack damage in tarmac road segment with exposed subgrade.");
                                }}
                                className="w-full py-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100 font-bold text-[10px] flex items-center justify-center space-x-1 shadow-sm animate-pulse"
                              >
                                <span>Simulate Photo Snap</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={handleReportSubmit}
                            disabled={duplicateChecking}
                            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center space-x-1 shadow-md cursor-pointer disabled:opacity-55"
                          >
                            <span>{duplicateChecking ? "Checking Duplicates..." : "Immutable Submit to Ledger"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConvoComplete(false);
                              setConvoHistory([{ sender: "bot", text: "Got it! Let's start over. Tell me, what local infrastructure or public utility issue would you like to report today?" }]);
                            }}
                            className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-5 text-black">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Short Descriptive Title</label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Water pipeline leakage on Soho Main Cross Road"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2.5 text-sm text-slate-850 outline-none focus:border-indigo-650 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Category Theme</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2.5 text-sm text-slate-850 outline-none focus:border-indigo-650 focus:bg-white cursor-pointer"
                        >
                          <option value="roads">Roads / Potholes</option>
                          <option value="water">Water Utilities</option>
                          <option value="electricity">Street Lighting / Solar</option>
                          <option value="education">School Classrooms / Upgrades</option>
                          <option value="sanitation">Public Sanitation Projects</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">GPS Coordinates</label>
                        <div className="flex space-x-2">
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-550 flex items-center font-mono">
                            {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                          </div>
                          <button
                            type="button"
                            onClick={getBrowserGPS}
                            disabled={gpsLoading}
                            className={`px-3 bg-slate-100 hover:bg-slate-150 border border-slate-200 text-slate-700 rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer ${
                              gpsSuccess ? "border-emerald-500 text-emerald-600" : ""
                            }`}
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{gpsLoading ? "Capturing..." : t.gpsCapture}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <VoiceRecorder
                        onTranscribed={(transcript, detectedLanguage) => {
                          setDescription(transcript);
                          if (!title) {
                            const langLabel = detectedLanguage && detectedLanguage.toLowerCase() !== "unknown" 
                              ? ` [${detectedLanguage}]` 
                              : "";
                            setTitle(`Voice Submission${langLabel}`);
                          }
                          setUsedVoice(true);
                        }}
                        placeholderText="Click microphone to dictate in Hindi/Kannada/Marathi/Tamil/English."
                        variant="form"
                      />

                      <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">{t.photoUpload}</span>
                        
                        {selectedImage ? (
                          <div className="flex items-center space-x-2">
                            <img 
                              src={selectedImage} 
                              alt="Upload preview" 
                              className="w-12 h-12 object-cover rounded border border-slate-350" 
                            />
                            <div className="flex-1 text-[10px] leading-tight text-slate-600">
                              <span className="block font-bold text-slate-800">photo_damage_log.jpg</span>
                              <input 
                                type="text"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder="Photo details (e.g. road pothole 3m wide)"
                                className="bg-transparent border-b border-slate-200 text-slate-700 outline-none w-full mt-1 text-[10px]"
                              />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => { setSelectedImage(null); setImagePrompt(""); }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-850"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=200");
                              setImagePrompt("Pothole damage in tarmac road segment with exposed subgrade.");
                              getBrowserGPS();
                            }}
                            className="w-full py-2 bg-white border border-slate-200 rounded font-bold text-xs text-slate-500 flex items-center justify-center space-x-2 shadow-sm"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Simulate Camera Snap</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Detailed Description</label>
                      <textarea 
                        required
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please specify structural defects, local constraints, and safety concerns..."
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-650 font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading || duplicateChecking}
                      className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <span>{submitLoading ? t.filingFeedback : duplicateChecking ? "Checking Duplicates..." : t.submitLedger}</span>
                      {!submitLoading && !duplicateChecking && <Send className="w-3.5 h-3.5" />}
                    </button>
                  </form>
                )}
              </div>

              {/* AI Intake pipeline results drawer (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* AI processing stepper animation */}
                {isProcessingAI && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-serif text-sm font-bold text-indigo-600 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Gemini AI Processing Pipeline...</span>
                    </h3>

                    <div className="space-y-3 font-mono text-[10px]">
                      {[
                        "Translating input using Gemini NLP...",
                        "Extracting category & tagging geolocation...",
                        "Detecting duplicate claims in Ward database...",
                        "Matching demographic indices & ward priorities...",
                        "Running ranking algorithm & computing demand score..."
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] ${
                            aiProcessingStep > idx ? "bg-emerald-500 text-white animate-pulse" :
                            aiProcessingStep === idx ? "bg-indigo-600 text-white animate-ping" :
                            "bg-slate-100 text-slate-400"
                          }`}>
                            {aiProcessingStep > idx ? "âœ“" : idx + 1}
                          </div>
                          <span className={aiProcessingStep === idx ? "text-indigo-650 font-bold animate-pulse" : "text-slate-500"}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Computed AI Demand Score results breakdown card */}
                {lastAiResult && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 text-slate-805">
                    <div className="border-b border-slate-150 pb-3">
                      <span className="text-[9px] font-mono text-indigo-600 uppercase tracking-widest block font-bold">AI Processing Complete</span>
                      <h4 className="font-serif text-base font-bold text-slate-900 mt-1 leading-tight">{lastAiResult.title}</h4>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                        <span>Theme:</span>
                        <span className="font-bold text-slate-700">{lastAiResult.theme}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Computed Demand Score</span>
                        <span className="font-serif text-4xl font-bold text-indigo-600">{lastAiResult.demand_score}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">/ 100 max weight</span>
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded font-bold border ${
                        lastAiResult.priorityLevel === 'CRITICAL' ? "bg-rose-50 border-rose-200 text-rose-700" :
                        lastAiResult.priorityLevel === 'ELEVATED' ? "bg-amber-50 border-amber-200 text-amber-700" :
                        "bg-slate-100 border-slate-200 text-slate-500"
                      }`}>
                        {lastAiResult.priorityLevel}
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Score Breakdown Weights:</span>
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs font-mono text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Complaint Count weight:</span>
                          <span className="text-slate-700">{lastAiResult.demand_score_breakdown.complaint_count} (initial report)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Severity Weighted Score:</span>
                          <span className="text-slate-700">{lastAiResult.demand_score_breakdown.severity_weighted_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Population Density Factor:</span>
                          <span className="text-slate-700">{lastAiResult.demand_score_breakdown.population_density_factor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Duplicate Suppression:</span>
                          <span className="text-slate-700">-{lastAiResult.demand_score_breakdown.duplicate_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Historical Neglect Factor:</span>
                          <span className="text-slate-700">+{lastAiResult.demand_score_breakdown.historical_neglect_factor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Demographic overlay */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Demographic Overlay Indices:</span>
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs font-mono text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Ward Population:</span>
                          <span className="text-slate-700">{lastAiResult.demographic_overlay.population.toLocaleString()} citizens</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Literacy Index:</span>
                          <span className="text-slate-700">{lastAiResult.demographic_overlay.literacy_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Avg Income Bracket:</span>
                          <span className="text-slate-700">{lastAiResult.demographic_overlay.avg_income_bracket}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Offline Sync Queue widget if items exist */}
                {offlineQueue.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-serif text-sm font-bold text-slate-800 border-b border-slate-150 pb-2 flex items-center justify-between">
                      <span>{t.offlineQueue}</span>
                      <WifiOff className="w-4 h-4 text-rose-500 animate-pulse" />
                    </h3>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {offlineQueue.map((item, index) => (
                        <div key={index} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-850">
                            <span>{item.title}</span>
                            <span className="text-[9px] text-slate-550 font-mono">Queued</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Priority Polling & Competing Projects Tab */}
          {activeTab === "polling" && (
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-slate-850 border-b border-slate-150 pb-3 mb-4 flex items-center space-x-2">
                  <ListOrdered className="w-5 h-5 text-indigo-650" />
                  <span>{t.competingProjects}</span>
                </h3>
                <p className="text-xs text-slate-650 leading-relaxed max-w-2xl mb-6">
                  Gemini AI has surfaced competing projects in your ward. Help your representative choose by casting priority upvotes!
                </p>

                {/* Comparison Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  
                  {/* Proposal Option 1 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase font-bold">Option A</span>
                      <h4 className="font-serif text-base font-bold text-slate-850 mt-2 leading-snug">District 74-B Primary School Classroom Renovation</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                        remora structural reinforcements and addition of 4 new digital learning classrooms. Resolves capacity overloads for 1,200 local children.
                      </p>
                      <div className="mt-4 bg-white p-3 rounded border border-slate-200 text-[11px] font-mono text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Infrastructure Category:</span>
                          <span className="text-slate-850 font-bold">Education</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Cost:</span>
                          <span className="text-slate-850 font-bold">â‚¹32,00,000</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => alert("Option A voted! Thank you.")}
                      className="mt-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Vote Priority Project A</span>
                    </button>
                  </div>

                  {/* Proposal Option 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase font-bold">Option B</span>
                      <h4 className="font-serif text-base font-bold text-slate-850 mt-2 leading-snug">Ward 3 Youth Vocational & Reskilling Center</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                        Repurposing empty district municipal building into adult trade apprenticeships and digital job skill reskilling training hubs.
                      </p>
                      <div className="mt-4 bg-white p-3 rounded border border-slate-200 text-[11px] font-mono text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Infrastructure Category:</span>
                          <span className="text-slate-850 font-bold">Youth Employment</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Cost:</span>
                          <span className="text-slate-850 font-bold">â‚¹24,50,000</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert("Option B voted! Thank you.")}
                      className="mt-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer flex items-center justify-center space-x-1.5 font-sans"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Vote Priority Project B</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* General Active Proposals Priority list */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-serif text-base font-bold text-slate-850 border-b border-slate-150 pb-2 mb-4">
                  Vote Priority Signal on Active Submissions
                </h3>
                <div className="space-y-4 font-sans">
                  {allProposals.slice(0, 4).map((p) => (
                    <div key={p.proposal_id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-850 font-serif">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Category: {p.category} | Current Priority Signal: {p.community_priority_signal || 0}</p>
                      </div>
                      
                      <button
                        onClick={() => handlePriorityPollVote(p.proposal_id)}
                        className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-600 font-bold text-[10px] uppercase rounded-lg flex items-center space-x-1 justify-center cursor-pointer shadow-sm"
                      >
                        <Play className="w-3 h-3 text-indigo-600" />
                        <span>Upvote priority signal (+10 pts)</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MP Announcements Tab */}
          {activeTab === "announcements" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm flex-1">
              <h3 className="font-serif text-xl font-bold text-slate-850 border-b border-slate-150 pb-4 mb-6 flex items-center space-x-2">
                <Volume2 className="w-5.5 h-5.5 text-indigo-650" />
                <span>Constituency Updates & MP Hearings</span>
              </h3>

              <div className="space-y-6">
                {constituencyUpdates.map((update: any) => (
                  <div key={update.id} className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3 relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 font-sans">
                      <h4 className="font-serif text-base font-bold text-indigo-700 group-hover:text-indigo-800 transition-colors">
                        {update.title}
                      </h4>
                      <span className="font-mono text-[9px] text-slate-505 bg-white border border-slate-250 px-2.5 py-0.5 rounded-full">
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed font-sans">{update.content}</p>
                    <div className="pt-2 border-t border-indigo-100 flex items-center space-x-1.5 font-mono text-[9px] text-slate-500">
                      <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{update.relevance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Chat Assistant Tab */}
          {activeTab === ("status_chat" as any) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm flex-1 flex flex-col justify-between min-h-[500px]">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-850 border-b border-slate-150 pb-4 mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5.5 h-5.5 text-[#6C5CE7]" />
                  <span>AI Status Tracking Assistant</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-sans">
                  Have questions about the status of your report? Ask our Gemini assistant. It will query the ledger audit trail to explain progress in plain language.
                </p>
                
                <div className="mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 font-mono">Select one of your complaints:</label>
                  <select
                    value={statusProposalId}
                    onChange={(e) => {
                      setStatusProposalId(e.target.value);
                      setStatusChatHistory([{ sender: "bot", text: `I am connected to the audit database for that complaint. Ask me anything about its current status, timeline details, or next steps.` }]);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-650 cursor-pointer font-sans"
                  >
                    <option value="">-- Choose one of your reports --</option>
                    {submissions.map((sub: any) => (
                      <option key={sub.db_id} value={sub.db_id}>
                        {sub.title} ({sub.status})
                      </option>
                    ))}
                  </select>
                </div>

                {statusProposalId ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between h-[360px] bg-slate-50/50">
                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-sans">
                      {statusChatHistory.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 rounded-xl shadow-sm leading-relaxed ${
                            chat.sender === 'user'
                              ? 'bg-indigo-650 text-white rounded-tr-none'
                              : 'bg-white border border-slate-200 rounded-tl-none text-slate-800'
                          }`}>
                            {chat.text}
                          </div>
                        </div>
                      ))}
                      {statusChatLoading && (
                        <div className="flex justify-start animate-pulse">
                          <div className="bg-white border border-slate-200 p-2.5 rounded-xl rounded-tl-none text-[10px] text-slate-500 font-mono shadow-sm">
                            Querying ledger records and synthesizing timeline...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleStatusSend} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
                      <input
                        type="text"
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        placeholder="e.g. why is this taking so long? / what was the latest update?"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-850 outline-none focus:border-indigo-650 font-sans"
                        disabled={statusChatLoading}
                      />
                      <button
                        type="submit"
                        disabled={statusChatLoading || !statusInput.trim()}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-all"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs font-mono border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                    Please select one of your submitted complaints from the dropdown above to start a conversation about its status.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Floating WhatsApp Simulator Button */}
      <button
        onClick={() => setIsWhatsappOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-40 hover:scale-105 transition-all"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">1</span>
      </button>

      {/* WhatsApp Window popup */}
      {isWhatsappOpen && (
        <div className="fixed bottom-20 right-6 w-[340px] h-[480px] bg-white border border-slate-250 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden z-50 animate-fadeIn text-slate-800">
          {/* Header */}
          <div className="bg-emerald-700 px-4 py-3 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">PP</div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Citizens Care WhatsApp Bot</h4>
                <span className="text-[8px] text-emerald-100 block font-mono">Gemini AI Assistant â€¢ Online</span>
              </div>
            </div>
            <button 
              onClick={() => setIsWhatsappOpen(false)}
              className="p-1 hover:bg-emerald-600 rounded text-emerald-100 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs bg-slate-50">
            {whatsappChat.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2.5 rounded-xl text-slate-800 shadow-sm ${
                  chat.sender === 'user' 
                    ? 'bg-emerald-50 border border-emerald-200 rounded-tr-none text-emerald-900' 
                    : 'bg-white border border-slate-200 rounded-tl-none'
                }`}>
                  <p className="leading-snug whitespace-pre-line">{chat.text}</p>
                  <span className="text-[7px] text-slate-500 font-mono block text-right mt-1">{chat.time}</span>
                </div>
              </div>
            ))}
            
            {isBotTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-xl rounded-tl-none text-[10px] text-slate-550 animate-pulse font-mono shadow-sm">
                  Gemini bot is writing transcription analysis...
                </div>
              </div>
            )}
          </div>

          {/* Input field */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
            <input
              type="text"
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendWhatsappMessage(); }}
              placeholder={isWhatsappRecording ? "Listening to voice..." : "Report issue (e.g. Broken road)..."}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              disabled={isWhatsappRecording}
            />
            <VoiceRecorder
              onTranscribed={(transcript) => {
                setWhatsappMessage(transcript);
              }}
              onRecordingStateChange={setIsWhatsappRecording}
              variant="whatsapp"
            />
            <button
              onClick={sendWhatsappMessage}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white cursor-pointer"
              disabled={isWhatsappRecording}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-12">
        Decentralized District Ledger System Â© {new Date().getFullYear()} // {user.constituency.name}
      </footer>
    </div>
  );
}
