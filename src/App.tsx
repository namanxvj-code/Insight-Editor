import React, { useState, useEffect, useRef } from "react";
import { InstagramProfile, Post } from "./types";
import { defaultProfile } from "./defaultData";
import PhoneSimulator from "./components/PhoneSimulator";
import PostDetailModal from "./components/PostDetailModal";
import { 
  Sparkles, HelpCircle, Sun, Moon, Info, ShieldAlert, BookOpen, 
  ExternalLink, RefreshCw, Smartphone, Plus, Trash2, Upload, Download, 
  RotateCcw, RotateCw, ChevronDown, Check, Eye
} from "lucide-react";

export default function App() {
  // Projects State
  const [projects, setProjects] = useState<InstagramProfile[]>(() => {
    const saved = localStorage.getItem("ig_simulator_projects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved projects:", e);
      }
    }
    return [defaultProfile];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return projects[0]?.id || defaultProfile.id;
  });

  // Current Active Profile
  const activeProfile = projects.find(p => p.id === currentProjectId) || projects[0] || defaultProfile;

  // History Stack (Undo/Redo) for the ACTIVE profile
  const [history, setHistory] = useState<InstagramProfile[]>([activeProfile]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Mobile OS Frame Mode (iOS / Android)
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android'>('ios');

  // General App workspace Theme (light/dark)
  const [workspaceTheme, setWorkspaceTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("ig_workspace_theme");
    return saved === 'light' ? 'light' : 'dark';
  });

  // Instagram Frame Theme (light/dark)
  const [isIGDarkMode, setIsIGDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ig_frame_dark_mode");
    return saved !== null ? saved === "true" : true;
  });

  // Modal active post state
  const [activePost, setActivePost] = useState<Post | null>(null);

  // Info Modal state
  const [showInfo, setShowInfo] = useState(false);

  // AI Import Dialog State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiUsername, setAiUsername] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState("");
  const [aiError, setAiError] = useState("");

  // JSON File input ref
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Apply general Workspace theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (workspaceTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem("ig_workspace_theme", workspaceTheme);
  }, [workspaceTheme]);

  // Save IG Dark Mode preference
  useEffect(() => {
    localStorage.setItem("ig_frame_dark_mode", String(isIGDarkMode));
  }, [isIGDarkMode]);

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ig_simulator_projects", JSON.stringify(projects));
    } catch (err) {
      console.warn("Could not persist projects to localStorage due to quota limit:", err);
    }
  }, [projects]);

  // Sync history when switching projects
  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    const targetProj = projects.find(p => p.id === projectId) || defaultProfile;
    setHistory([targetProj]);
    setHistoryIndex(0);
    setActivePost(null);
  };

  // Profile update core handler (pushes state to history & updates projects list)
  const handleUpdateProfile = (updated: InstagramProfile, bypassHistory = false) => {
    // 1. Update project in list
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));

    // 2. Update History Stack
    if (!bypassHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updated);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Undo Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevProfileState = history[prevIndex];
      handleUpdateProfile(prevProfileState, true);
    }
  };

  // Redo Action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextProfileState = history[nextIndex];
      handleUpdateProfile(nextProfileState, true);
    }
  };

  // Create/Add new project
  const handleAddProject = (name?: string) => {
    const defaultName = name || `Mockup ${projects.length + 1}`;
    const newProj: InstagramProfile = {
      id: `proj_${Date.now()}`,
      projectName: defaultName,
      username: `mock_user_${projects.length + 1}`,
      displayName: defaultName,
      profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400",
      bio: "This is a clean, blank Instagram profile mockup bio ready to edit ✨",
      website: "linktr.ee/cozy",
      category: "Digital Creator",
      isVerified: false,
      isPrivate: false,
      followersCount: 5200,
      followingCount: 310,
      highlights: [],
      posts: [],
      taggedPosts: [],
      activeTab: "posts"
    };

    setProjects(prev => [...prev, newProj]);
    setCurrentProjectId(newProj.id);
    setHistory([newProj]);
    setHistoryIndex(0);
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (id === "default_wanderlust") return; // Keep default
    const filtered = projects.filter(p => p.id !== id);
    setProjects(filtered);
    
    // Fall back to first project
    const nextProjId = filtered[0]?.id || defaultProfile.id;
    setCurrentProjectId(nextProjId);
    
    const nextProj = filtered[0] || defaultProfile;
    setHistory([nextProj]);
    setHistoryIndex(0);
  };

  // Import JSON mockup profile
  const handleImportJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Handle array of projects vs single project
      if (Array.isArray(parsed)) {
        const validated = parsed.filter(p => p.username);
        if (validated.length > 0) {
          setProjects(validated);
          setCurrentProjectId(validated[0].id);
          setHistory([validated[0]]);
          setHistoryIndex(0);
        }
      } else if (parsed.username) {
        // Single project
        const newProj: InstagramProfile = {
          ...parsed,
          id: parsed.id || `proj_${Date.now()}`,
          projectName: parsed.projectName || `Imported @${parsed.username}`
        };

        // If project already exists, replace it, otherwise append
        setProjects(prev => {
          const exists = prev.some(p => p.id === newProj.id);
          if (exists) {
            return prev.map(p => p.id === newProj.id ? newProj : p);
          }
          return [...prev, newProj];
        });

        setCurrentProjectId(newProj.id);
        setHistory([newProj]);
        setHistoryIndex(0);
      }
    } catch (e) {
      alert("Error parsing imported JSON mockup file.");
    }
  };

  // Export selected project as file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `instagram_mockup_${activeProfile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Update a single post inside active profile
  const handleUpdatePost = (updatedPost: Post) => {
    const updatedPosts = activeProfile.posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    const updatedProfile = {
      ...activeProfile,
      posts: updatedPosts
    };
    handleUpdateProfile(updatedProfile);
    
    // Sync active post in modal
    setActivePost(updatedPost);
  };

  // Delete a single post inside active profile
  const handleDeletePost = () => {
    if (!activePost) return;
    const updatedPosts = activeProfile.posts.filter(p => p.id !== activePost.id);
    const updatedProfile = {
      ...activeProfile,
      posts: updatedPosts
    };
    handleUpdateProfile(updatedProfile);
    setActivePost(null);
  };

  // Duplicate active post inside active profile
  const handleDuplicatePost = () => {
    if (!activePost) return;
    const duplicated: Post = {
      ...activePost,
      id: `post_dup_${Date.now()}`,
      caption: `${activePost.caption} (Copy)`,
      likes: activePost.likes,
      uploadDate: "Just now",
      comments: activePost.comments.map(c => ({ ...c, id: `comment_dup_${Date.now()}_${Math.random()}` }))
    };

    const updatedProfile = {
      ...activeProfile,
      posts: [duplicated, ...activeProfile.posts]
    };
    handleUpdateProfile(updatedProfile);
    setActivePost(null);
  };

  // Create/Add a new default post inside active profile
  const handleAddPost = (type: 'image' | 'video' | 'carousel' = 'image') => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      type: type,
      mediaUrl: type === 'video' 
        ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop" 
        : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop",
      caption: "This is a clean, stunning mockup post. Tap on me to edit my photo, captions, views, likes, comments, or view professional insights!",
      likes: 1240,
      shares: 186,
      saves: 272,
      views: type === 'video' ? 4500 : 0,
      uploadDate: "Just now",
      location: "San Francisco, California",
      taggedUsers: [],
      comments: [
        {
          id: `comment_default_${Date.now()}`,
          username: "awesome_commenter",
          profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          text: "This is stunning! Keep it up 🙌",
          likes: 2,
          timestamp: "1m"
        }
      ],
      insights: {
        reach: 9920,
        impressions: 11780,
        accountsEngaged: 1612,
        profileVisits: 310,
        follows: 62,
        websiteTaps: 37,
        shares: 186,
        saves: 272,
        watchTime: type === 'video' ? "1h 45m" : "0s",
        avgWatchTime: type === 'video' ? "0:12" : "0s",
        chartPointsAll: [150, 420, 890, 1362, 1100, 750],
        chartPointsFollowers: [80, 210, 520, 780, 610, 430],
        chartPointsNonFollowers: [70, 210, 370, 582, 490, 320]
      }
    };

    const updatedProfile = {
      ...activeProfile,
      posts: [newPost, ...activeProfile.posts]
    };
    handleUpdateProfile(updatedProfile);
    setActivePost(newPost); // Open detailed editor immediately
  };

  // AI Profile Import / Generation Flow
  const handleAIImport = async () => {
    if (!aiUsername.trim()) return;
    setIsGeneratingAI(true);
    setAiError("");
    setAiStatusMsg("Connecting with AI intelligence...");
    
    const messages = [
      "Analyzing profile handle...",
      "Scouting popular aesthetics for theme...",
      "Generating high-resolution Unsplash photo matches...",
      "Simulating comments from followers...",
      "Formulating realistic professional insights dashboard...",
      "Securing the mockup project files..."
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      if (msgIndex < messages.length - 1) {
        msgIndex++;
        setAiStatusMsg(messages[msgIndex]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/import-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: aiUsername.trim() }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (response.ok && data.username) {
        handleImportJSON(JSON.stringify(data));
        setAiUsername("");
        setIsGeneratingAI(false);
        setShowAIModal(false);
      } else {
        throw new Error(data.error || "Failed to generate realistic profile");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setAiError(err.message || "Something went wrong. Let's try filling in fields manually!");
      setIsGeneratingAI(false);
    }
  };

  // JSON File Import Handler
  const handleJSONFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const parsed = JSON.parse(text);
          if (parsed.username || (Array.isArray(parsed) && parsed[0]?.username)) {
            handleImportJSON(text);
          } else {
            alert("Invalid JSON format. Please upload a valid Instagram Simulator export.");
          }
        } catch (error) {
          alert("Error reading file: Invalid JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`h-[100dvh] w-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${workspaceTheme === 'dark' ? 'bg-[#0B1014] text-zinc-100' : 'bg-zinc-50 text-zinc-800'}`}>
      
      {/* Hidden inputs for JSON and image file uploaders */}
      <input 
        type="file" 
        ref={jsonFileInputRef} 
        onChange={handleJSONFileImport} 
        accept=".json" 
        className="hidden" 
      />



      {/* Main content centered phone sandbox */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0B1014] md:bg-zinc-100/50 md:dark:bg-[#0B1014] relative justify-center">
        
        {/* Beautiful Simulator Canvas */}
        <div className="p-0 md:py-4 flex-1 flex items-center justify-center w-full min-h-0 overflow-hidden">
          <PhoneSimulator
            profile={activeProfile}
            isIGDarkMode={isIGDarkMode}
            deviceOS={deviceOS}
            onToggleOS={() => setDeviceOS(deviceOS === 'ios' ? 'android' : 'ios')}
            onUpdateProfile={handleUpdateProfile}
            onPostClick={(post) => setActivePost(post)}
            onAddPost={handleAddPost}
            onImportJSON={handleImportJSON}
          />
        </div>
      </main>

      {/* MODAL: Detailed Interactive Post Editor */}
      {activePost && (
        <PostDetailModal
          post={activePost}
          username={activeProfile.username}
          profilePic={activeProfile.profilePic}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onDuplicatePost={handleDuplicatePost}
          onClose={() => setActivePost(null)}
        />
      )}

      {/* MODAL: How to Use Workspace Helper */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg text-zinc-950 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>Mockup Studio Guidelines</span>
            </h3>

            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">1. Smart Touch Editing</h4>
                <p>Tap directly on counts, display name, category, website, bio, verified badge, or highlight circles to edit them instantly via our mobile-first touch bottom sheet.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">2. Direct Post Creation</h4>
                <p>Click the <strong>Plus (+)</strong> icon inside the simulator profile header to instantly add new Photo Posts, Reels, or Carousels directly to your active feed grid.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">3. Custom Generated AI Auto-Fill</h4>
                <p>Click the <strong>AI Auto-Fill</strong> button in the top toolbar. Enter any handle (e.g. <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-indigo-600 dark:text-indigo-400">gourmet_traveler</code>). The integrated Gemini AI will dynamically generate a cohesive profile with custom posts, captions, comments, and realistic metrics!</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">4. Professional Analytics Insights</h4>
                <p>Click on any post in your simulator feed, then click <strong>View Insights</strong>. You can completely configure and custom-design high-fidelity interactive insights, charts, and metrics.</p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs rounded-xl transition hover:opacity-90 shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* MODAL: AI Profile Auto-Fill Gemini Generator */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isGeneratingAI && setShowAIModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-base text-zinc-950 dark:text-zinc-50 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>AI Profile Generation</span>
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4 leading-normal">
              Enter any Instagram username handle. Our integrated Gemini model will instantly build, draft, and assemble a complete high-fidelity mockup profile with tailored bio, followers, matching posts, comments, and full custom insights!
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Handle Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    disabled={isGeneratingAI}
                    value={aiUsername}
                    onChange={(e) => setAiUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    placeholder="e.g. wanderlust_sam"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {aiError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 leading-normal">
                  {aiError}
                </div>
              )}

              {isGeneratingAI ? (
                <div className="py-4 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse text-center">{aiStatusMsg}</span>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAIImport}
                    disabled={!aiUsername.trim()}
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl hover:brightness-110 transition shadow-sm"
                  >
                    Generate Mockup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
