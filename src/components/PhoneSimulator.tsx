import React, { useState, useEffect } from "react";
import { InstagramProfile, Post, Highlight } from "../types";
import { parseCleanInt } from "../utils";
import { 
  Grid, Tv, Film, UserSquare2, Bookmark, Lock, Bell, Heart, MessageCircle, Send, 
  MapPin, ChevronDown, CheckCircle, Plus, Compass, Search, Home, PlusSquare, 
  Menu, Sparkles, User, Info, Smartphone, Eye, Volume2, Music, ExternalLink, RotateCcw,
  MoreHorizontal, X
} from "lucide-react";

interface PhoneSimulatorProps {
  profile: InstagramProfile;
  isIGDarkMode: boolean;
  deviceOS?: 'ios' | 'android';
  onToggleOS?: () => void;
  onUpdateProfile: (updated: InstagramProfile) => void;
  onPostClick: (post: Post) => void;
  onHighlightClick?: (hl: Highlight) => void;
  onAddPost: (type: "image" | "video" | "carousel") => void;
  onImportJSON: (jsonStr: string) => void;
}

export default function PhoneSimulator({
  profile,
  isIGDarkMode,
  deviceOS = 'ios',
  onToggleOS,
  onUpdateProfile,
  onPostClick,
  onAddPost,
  onImportJSON
 }: PhoneSimulatorProps) {
  // Local OS state fallback
  const [localOS, setLocalOS] = useState<'ios' | 'android'>(deviceOS);
  const currentOS = deviceOS || localOS;

  const handleToggleOS = () => {
    if (onToggleOS) {
      onToggleOS();
    } else {
      setLocalOS(prev => prev === 'ios' ? 'android' : 'ios');
    }
  };

  // Clock time state for native status bar
  const [currentTime, setCurrentTime] = useState<string>("9:41");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      hours = hours % 12 || 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours}:${minutesStr}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  // Bottom navigation tab state
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'search' | 'create' | 'reels' | 'profile'>('profile');
  
  // Search and import states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = searchQuery.trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "");
    if (!handle) return;

    setIsSearching(true);
    setSearchError("");
    setSearchStatus("Accessing Instagram database...");

    const messages = [
      "Accessing Instagram database...",
      "Scoping theme aesthetics for @" + handle + "...",
      "Matching high-resolution Unsplash photos...",
      "Generating realistic follower interactions...",
      "Assembling editable insights dashboard...",
      "Finishing mockup structures..."
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < messages.length - 1) {
        step++;
        setSearchStatus(messages[step]);
      }
    }, 1100);

    try {
      const response = await fetch("/api/import-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: handle })
      });
      const data = await response.json();
      clearInterval(interval);

      if (response.ok && data.username) {
        onImportJSON(JSON.stringify(data));
        setSearchQuery("");
        setIsSearching(false);
        setActiveNavTab("profile"); // Switch to profile tab immediately!
      } else {
        throw new Error(data.error || "Profile is private or does not exist. Please check spelling.");
      }
    } catch (err: any) {
      clearInterval(interval);
      setSearchError(err.message || "Failed to lookup profile. Check spelling or try building manually.");
      setIsSearching(false);
    }
  };

  // Inline editing state and ref
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [showAddPostMenu, setShowAddPostMenu] = useState(false);
  const inlineFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleInlineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile({ ...profile, profilePic: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Follower interaction states
  const [isFollowing, setIsFollowing] = useState(false);
  const [visitorFollowersOffset, setVisitorFollowersOffset] = useState(0);

  // Active Highlight Story Player state
  const [activeStory, setActiveStory] = useState<Highlight | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Dynamic system clock state for status bar
  const [timeStr, setTimeStr] = useState("9:41 AM");

  // Drag and drop posts state
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  // Story player auto-increment progress
  useEffect(() => {
    let timer: any;
    if (activeStory) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            setActiveStory(null);
            return 0;
          }
          return prev + 1.5;
        });
      }, 50);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeStory]);

  // Format Large Count Helper (Instagram style: 142.5K, 1.2M)
  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toLocaleString();
  };

  // Bio parser to highlight hashtags, links and tags in blue
  const parseBio = (text: string) => {
    if (!text) return "";
    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      if (word.startsWith("#")) {
        return <span key={i} className="text-indigo-600 dark:text-sky-400 font-medium hover:underline cursor-pointer">{word}</span>;
      }
      if (word.startsWith("@")) {
        return <span key={i} className="text-indigo-600 dark:text-sky-400 font-medium hover:underline cursor-pointer">{word}</span>;
      }
      return word;
    });
  };

  // Drag and drop posts handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPostId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPostId || draggedPostId === targetId) return;

    const postList = [...profile.posts];
    const draggedIndex = postList.findIndex(p => p.id === draggedPostId);
    const targetIndex = postList.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Swap positions
    const temp = postList[draggedIndex];
    postList[draggedIndex] = postList[targetIndex];
    postList[targetIndex] = temp;

    onUpdateProfile({
      ...profile,
      posts: postList
    });

    setDraggedPostId(null);
  };

  // Touch editor state for instant on-screen customization of profile properties
  const [activeTouchEdit, setActiveTouchEdit] = useState<{
    field: "username" | "displayName" | "category" | "bio" | "website" | "postsCountOverride" | "followersCount" | "followingCount" | "isVerified" | "isPrivate" | "profilePic";
    title: string;
    type: "text" | "number" | "textarea" | "boolean" | "image";
    value: any;
  } | null>(null);

  // Follow visitor toggle
  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setVisitorFollowersOffset(0);
    } else {
      setIsFollowing(true);
      setVisitorFollowersOffset(1);
    }
  };

  const handleTouchSave = () => {
    if (!activeTouchEdit) return;
    const { field, value } = activeTouchEdit;
    
    // Cast appropriately based on input type
    let finalValue = value;
    if (activeTouchEdit.type === "number") {
      finalValue = parseCleanInt(value);
    }
    
    onUpdateProfile({
      ...profile,
      [field]: finalValue
    });
    setActiveTouchEdit(null);
  };

  return (
    <div className="flex-1 w-full h-full h-[100dvh] md:h-[840px] md:max-h-[88vh] md:max-w-[400px] md:mx-auto flex flex-col relative select-none overflow-hidden">
      <input type="file" ref={inlineFileInputRef} onChange={handleInlineFileChange} accept="image/*" className="hidden" />
      
      {/* Seamless Native App Interface */}
      <div className={`flex-1 flex flex-col rounded-none md:rounded-[36px] overflow-hidden relative shadow-none md:shadow-2xl border-0 md:border-4 border-zinc-200 dark:border-zinc-800 ${isIGDarkMode ? "bg-[#0B1014] text-white" : "bg-white text-zinc-900"}`}>
        


        {/* SCREEN BODY SCROLLER */}
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0 relative scrollbar-none">
            
            {/* TAB-DEPENDENT SCREENS */}
            
            {/* 1. INSTAGRAM FEED (HOME) */}
            {activeNavTab === 'home' && (
              <div className="flex-1 flex flex-col text-left">
                {/* Home Header */}
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                  <span className="font-serif italic font-extrabold text-xl tracking-wide">Instagram</span>
                  <div className="flex gap-4">
                    <Heart className="w-5 h-5" />
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>

                {/* Simulated Feed Posts */}
                <div className="space-y-4 pb-12">
                  {/* Active Stories row mockup */}
                  <div className="p-3 flex gap-3 overflow-x-auto border-b border-zinc-100 dark:border-zinc-850 scrollbar-none shrink-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                        <img src={profile.profilePic} alt="story" className="w-11 h-11 rounded-full object-cover border border-white dark:border-black" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[9px] mt-1 text-zinc-500 font-medium">Your Story</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100" alt="story" className="w-11 h-11 rounded-full object-cover border border-white dark:border-black" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[9px] mt-1 text-zinc-500 font-medium">wanderer</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="p-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100" alt="story" className="w-11 h-11 rounded-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[9px] mt-1 text-zinc-400">sam_lenses</span>
                    </div>
                  </div>

                  {/* Feed post 1 */}
                  <div className="space-y-2 text-left">
                    <div className="px-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-[11px] font-bold">@travel_magazine</p>
                          <p className="text-[8px] text-zinc-400">Sponsored</p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                    </div>
                    <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&fit=crop" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                    <div className="px-3 py-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <Heart className="w-5 h-5 hover:text-red-500" />
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <p className="text-[11px] font-bold mt-1">4,812 likes</p>
                      <p className="text-[10px] leading-normal"><span className="font-bold">@travel_magazine</span> Exploring the deep blue waters of Amalfi Coast this summer! Click the link to read our full vacation guide! 🏖️🛥️</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EXPLORE SEARCH (SEARCH) */}
            {activeNavTab === 'search' && (
              <div className="flex-1 flex flex-col text-left">
                {/* Search Header Form */}
                <form onSubmit={handleSearchSubmit} className="p-3 shrink-0 border-b border-zinc-100 dark:border-zinc-850">
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2 text-zinc-400 focus-within:ring-1 focus-within:ring-indigo-500 transition relative">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter public IG username... (e.g. food_lover)"
                      disabled={isSearching}
                      className="bg-transparent text-xs w-full focus:outline-none text-zinc-800 dark:text-zinc-150 font-bold placeholder-zinc-400"
                    />
                    {searchQuery && !isSearching && (
                      <button type="button" onClick={() => setSearchQuery("")} className="shrink-0 p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
                        <X className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Search Body Content */}
                <div className="flex-1 flex flex-col relative min-h-0">
                  {isSearching ? (
                    /* Elegant Loading State Overlay */
                    <div className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900 flex items-center justify-center mb-4">
                        <RotateCcw className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                      <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 mb-1">Cloning Instagram Account</h4>
                      <p className="text-[10px] text-zinc-400 max-w-[200px] mb-3 leading-normal">Using public profile metadata to assemble your editable mockup.</p>
                      
                      <div className="px-3 py-1.5 bg-indigo-50/50 dark:bg-zinc-900 border border-indigo-100/40 dark:border-zinc-800 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">{searchStatus}</span>
                      </div>
                    </div>
                  ) : searchError ? (
                    /* Clear Error Message Card with manually-build instructions */
                    <div className="p-6 text-center flex flex-col items-center justify-center my-auto animate-in fade-in duration-150">
                      <div className="w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 mb-3 border border-rose-100 dark:border-rose-900/30">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 mb-1">Could Not Retrieve Profile</h4>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[240px] mb-4 leading-normal">
                        {searchError}
                      </p>
                      <div className="flex flex-col gap-2 w-full max-w-[200px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchError("");
                            setSearchQuery("");
                          }}
                          className="py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] rounded-xl transition"
                        >
                          Clear & Search Again
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNavTab("profile");
                            setIsInlineEditing(true);
                          }}
                          className="py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl transition shadow-sm"
                        >
                          Build Mockup Manually
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Default Explore Screen with suggestions to clone */
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Interactive suggestions to showcase cloning */}
                      <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-850">
                        <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">Popular Mockup Presets</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {["gourmet_traveler", "fitness_pro", "wanderer_clara", "tech_lens"].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setSearchQuery(preset);
                                // Trigger submission by setting query and calling search directly
                                setTimeout(() => {
                                  const handle = preset;
                                  setIsSearching(true);
                                  setSearchError("");
                                  setSearchStatus("Accessing Instagram database...");
                                  
                                  const messages = [
                                    "Accessing Instagram database...",
                                    "Scoping theme aesthetics for @" + handle + "...",
                                    "Matching high-resolution Unsplash photos...",
                                    "Generating realistic follower interactions...",
                                    "Assembling editable insights dashboard...",
                                    "Finishing mockup structures..."
                                  ];

                                  let step = 0;
                                  const interval = setInterval(() => {
                                    if (step < messages.length - 1) {
                                      step++;
                                      setSearchStatus(messages[step]);
                                    }
                                  }, 1100);

                                  fetch("/api/import-profile", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ username: handle })
                                  })
                                  .then(res => res.json())
                                  .then(data => {
                                    clearInterval(interval);
                                    if (data.username) {
                                      onImportJSON(JSON.stringify(data));
                                      setSearchQuery("");
                                      setIsSearching(false);
                                      setActiveNavTab("profile");
                                    } else {
                                      throw new Error(data.error || "Profile is private or does not exist.");
                                    }
                                  })
                                  .catch(err => {
                                    clearInterval(interval);
                                    setSearchError(err.message || "Failed to lookup profile.");
                                    setIsSearching(false);
                                  });
                                }, 50);
                              }}
                              className="text-[9px] font-extrabold px-2 py-1 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition"
                            >
                              @{preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Explore Grid preview */}
                      <div className="flex-1 grid grid-cols-3 gap-0.5 pb-12">
                        <img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        
                        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&fit=crop" className="aspect-square object-cover col-span-2 row-span-2 bg-zinc-200" referrerPolicy="no-referrer" />
                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        <img src="https://images.unsplash.com/photo-1510379872535-71102c09896c?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        
                        <img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                        <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&fit=crop" className="aspect-square object-cover bg-zinc-200" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. MOCKUP CREATOR (CREATE) */}
            {activeNavTab === 'create' && (
              <div className="flex-1 flex flex-col p-4 text-center justify-center items-center">
                <PlusSquare className="w-12 h-12 text-zinc-400 mb-2" />
                <h3 className="font-extrabold text-sm">Post Wizard Shortcut</h3>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[240px] leading-normal">
                  You can publish new mock posts directly using the **Create New Post** button inside the side configuration panel!
                </p>
                <div className="mt-4 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-[9px] text-zinc-400">
                  Publishing instantly adds your posts to the profile feed grid.
                </div>
              </div>
            )}

            {/* 4. REELS PLAYER (REELS) */}
            {activeNavTab === 'reels' && (
              <div className="flex-1 bg-black flex flex-col justify-between relative text-left">
                {/* Reels background image */}
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80" 
                  referrerPolicy="no-referrer" 
                />
                
                {/* Reels overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 p-4 flex flex-col justify-between text-white">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Reels</span>
                    <Volume2 className="w-5 h-5 text-white/80" />
                  </div>

                  {/* Bottom details and icons */}
                  <div className="flex items-end justify-between mt-auto">
                    {/* Caption / User details */}
                    <div className="flex-1 pr-4 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100" className="w-7 h-7 rounded-full object-cover border border-white/40" />
                        <span className="font-bold text-xs">@wanderlust_clara</span>
                        <span className="px-1.5 py-0.5 rounded border border-white/50 text-[8px] font-bold">Follow</span>
                      </div>
                      <p className="text-[10px] text-white/90 leading-normal line-clamp-2">
                        No matter where you go, let the road teach you what maps cannot. Morning views in Lofoten Norway are magical! 🏔️🎒
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-white/70">
                        <Music className="w-3.5 h-3.5 animate-spin" />
                        <span className="truncate">Original Audio • @wanderlust_clara</span>
                      </div>
                    </div>

                    {/* Right vertical action rail */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                      <div className="flex flex-col items-center gap-0.5">
                        <Heart className="w-6 h-6 fill-rose-600 text-rose-600 animate-pulse" />
                        <span className="text-[10px] font-bold">24.5K</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-[10px] font-bold">182</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Send className="w-6 h-6" />
                        <span className="text-[10px] font-bold">2.4K</span>
                      </div>
                      <Bookmark className="w-6 h-6" />
                    </div>

                  </div>

                </div>
              </div>
            )}


            {/* 5. INSTAGRAM PROFILE SCREEN (CORE ACTIVE SIMULATOR) */}
            {activeNavTab === 'profile' && (
              <div className="flex-1 flex flex-col">
                
                {/* Profile Top Bar */}
                {isInlineEditing ? (
                  <div className="h-11 px-4 flex items-center justify-between border-b border-sky-100 bg-sky-50 dark:bg-zinc-900/95 dark:border-sky-950 shrink-0 select-none">
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-sky-700 dark:text-sky-400">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                      <span>Inline Editor Active</span>
                    </div>
                    <button 
                      onClick={() => setIsInlineEditing(false)} 
                      className="px-2.5 py-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-white font-black text-[10px] rounded-full transition shadow-sm uppercase tracking-wider"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="h-11 px-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 shrink-0">
                    <div 
                      className="flex items-center gap-1 text-sm font-black tracking-tight select-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1.5 py-0.5 transition"
                      onClick={() => setActiveTouchEdit({ field: "username", title: "Instagram Username", type: "text", value: profile.username })}
                    >
                      {profile.isPrivate && <Lock className="w-3.5 h-3.5 text-zinc-500" />}
                      <span>@{profile.username || "username"}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <div className="flex items-center gap-4 relative">
                      <PlusSquare 
                        className="w-5 h-5 cursor-pointer hover:text-sky-500 transition" 
                        onClick={() => setShowAddPostMenu(!showAddPostMenu)} 
                      />
                      {showAddPostMenu && (
                        <div className="absolute right-6 top-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 w-36 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                          <button
                            onClick={() => {
                              onAddPost("image");
                              setShowAddPostMenu(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
                          >
                            <Grid className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Add Photo Post</span>
                          </button>
                          <button
                            onClick={() => {
                              onAddPost("video");
                              setShowAddPostMenu(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
                          >
                            <Film className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Add Reel Post</span>
                          </button>
                          <button
                            onClick={() => {
                              onAddPost("carousel");
                              setShowAddPostMenu(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Add Carousel Post</span>
                          </button>
                        </div>
                      )}
                      <Menu className="w-5 h-5 cursor-pointer hover:text-sky-500 transition" onClick={() => setIsInlineEditing(true)} />
                    </div>
                  </div>
                )}

                {/* Main scrollable grid layout */}
                <div className="flex-1">
                  
                  {/* Stats Row */}
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    {/* Profile Picture with Highlights colorful border story indicator */}
                    {isInlineEditing ? (
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => inlineFileInputRef.current?.click()}
                        title="Click to change profile picture"
                      >
                        <div className="p-0.5 rounded-full bg-sky-450 dark:bg-sky-500 animate-pulse">
                          <img 
                            src={profile.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400"} 
                            alt="avatar" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-black bg-zinc-100 brightness-75 group-hover:brightness-50 transition" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-[9px] font-black bg-black/30 rounded-full">
                          <span>TAP TO</span>
                          <span>UPLOAD</span>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => inlineFileInputRef.current?.click()}
                        title="Tap to change profile picture"
                      >
                        <div className={`p-0.5 rounded-full ${profile.highlights.length > 0 ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "border border-zinc-200 dark:border-zinc-800"}`}>
                          <img 
                            src={profile.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400"} 
                            alt="avatar" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-black bg-zinc-100" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 border-2 border-white dark:border-black cursor-pointer">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    )}

                    {/* Stats columns */}
                    <div className="flex-1 flex items-center justify-around text-center max-w-[220px]">
                      {isInlineEditing ? (
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            value={profile.postsCountOverride ?? profile.posts.length}
                            onChange={(e) => onUpdateProfile({ ...profile, postsCountOverride: parseCleanInt(e.target.value) })}
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded text-center text-xs font-extrabold focus:outline-none w-11 py-0.5 text-zinc-900 dark:text-zinc-100"
                            title="Posts count override"
                          />
                          <span className="text-[10px] text-zinc-500 mt-1">Posts</span>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded p-1 transition"
                          onClick={() => setActiveTouchEdit({ field: "postsCountOverride", title: "Edit Posts Count", type: "number", value: profile.postsCountOverride ?? profile.posts.length })}
                        >
                          <span className="block text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                            {profile.postsCountOverride ?? profile.posts.length}
                          </span>
                          <span className="text-[10px] text-zinc-500">Posts</span>
                        </div>
                      )}

                      {isInlineEditing ? (
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            value={profile.followersCount}
                            onChange={(e) => onUpdateProfile({ ...profile, followersCount: parseCleanInt(e.target.value) })}
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded text-center text-xs font-extrabold focus:outline-none w-16 py-0.5 text-zinc-900 dark:text-zinc-100"
                            title="Followers count"
                          />
                          <span className="text-[10px] text-zinc-500 mt-1">Followers</span>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded p-1 transition"
                          onClick={() => setActiveTouchEdit({ field: "followersCount", title: "Edit Followers Count", type: "number", value: profile.followersCount })}
                        >
                          <span className="block text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                            {formatCount(profile.followersCount + visitorFollowersOffset)}
                          </span>
                          <span className="text-[10px] text-zinc-500">Followers</span>
                        </div>
                      )}

                      {isInlineEditing ? (
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            value={profile.followingCount}
                            onChange={(e) => onUpdateProfile({ ...profile, followingCount: parseCleanInt(e.target.value) })}
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded text-center text-xs font-extrabold focus:outline-none w-14 py-0.5 text-zinc-900 dark:text-zinc-100"
                            title="Following count"
                          />
                          <span className="text-[10px] text-zinc-500 mt-1">Following</span>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded p-1 transition"
                          onClick={() => setActiveTouchEdit({ field: "followingCount", title: "Edit Following Count", type: "number", value: profile.followingCount })}
                        >
                          <span className="block text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                            {formatCount(profile.followingCount)}
                          </span>
                          <span className="text-[10px] text-zinc-500">Following</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Description / Bio (text aligned-left) */}
                  <div className="px-4 text-left leading-tight space-y-2">
                    {isInlineEditing ? (
                      <div className="space-y-2 w-full">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-sky-750 dark:text-sky-400 uppercase block">Display Name</label>
                          <input
                            type="text"
                            value={profile.displayName}
                            onChange={(e) => onUpdateProfile({ ...profile, displayName: e.target.value })}
                            placeholder="Display Name"
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-extrabold focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-sky-750 dark:text-sky-400 uppercase block">Category</label>
                          <input
                            type="text"
                            value={profile.category}
                            onChange={(e) => onUpdateProfile({ ...profile, category: e.target.value })}
                            placeholder="Category (e.g. Digital Creator)"
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-sky-750 dark:text-sky-400 uppercase block">Biography</label>
                          <textarea
                            value={profile.bio}
                            onChange={(e) => onUpdateProfile({ ...profile, bio: e.target.value })}
                            placeholder="Bio..."
                            rows={3}
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full resize-none leading-normal"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-sky-750 dark:text-sky-400 uppercase block">Website URL</label>
                          <input
                            type="text"
                            value={profile.website}
                            onChange={(e) => onUpdateProfile({ ...profile, website: e.target.value })}
                            placeholder="website.com"
                            className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded px-2 py-1 text-[11px] text-indigo-600 dark:text-sky-400 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                          />
                        </div>
                        
                        {/* Verified and Private Account toggles */}
                        <div className="flex gap-4 pt-1 select-none">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            <input
                              type="checkbox"
                              checked={profile.isVerified}
                              onChange={(e) => onUpdateProfile({ ...profile, isVerified: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 bg-sky-50 dark:bg-zinc-800 border-sky-300 dark:border-zinc-700 w-3.5 h-3.5"
                            />
                            <span>Verified Badge</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            <input
                              type="checkbox"
                              checked={profile.isPrivate}
                              onChange={(e) => onUpdateProfile({ ...profile, isPrivate: e.target.checked })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 bg-sky-50 dark:bg-zinc-800 border-sky-300 dark:border-zinc-700 w-3.5 h-3.5"
                            />
                            <span>Private Account</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1 w-fit transition" onClick={() => setActiveTouchEdit({ field: "displayName", title: "Edit Display Name", type: "text", value: profile.displayName })}>
                          <h2 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-50">{profile.displayName || "Display Name"}</h2>
                          {profile.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500 shrink-0" />
                          )}
                        </div>
                        {profile.category && (
                          <p 
                            className="text-[10px] font-semibold text-zinc-400 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1 w-fit transition"
                            onClick={() => setActiveTouchEdit({ field: "category", title: "Profile Category", type: "text", value: profile.category })}
                          >
                            {profile.category}
                          </p>
                        )}
                        <p 
                          className="text-[11px] text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1 transition"
                          onClick={() => setActiveTouchEdit({ field: "bio", title: "Edit Biography", type: "textarea", value: profile.bio })}
                        >
                          {parseBio(profile.bio)}
                        </p>
                        {profile.website && (
                          <div 
                            className="pt-0.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1 w-fit transition"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTouchEdit({ field: "website", title: "Edit Website", type: "text", value: profile.website });
                            }}
                          >
                            <a 
                              href={`https://${profile.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[11px] font-bold text-indigo-600 dark:text-sky-400 inline-flex items-center gap-0.5 hover:underline"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>{profile.website}</span>
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Native Instagram Owner Action Buttons */}
                  <div className="px-4 py-2 grid grid-cols-3 gap-2 shrink-0 select-none">
                    <button
                      onClick={() => setActiveTouchEdit({ field: "displayName", title: "Edit Profile Details", type: "text", value: profile.displayName })}
                      className="col-span-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-2 text-center text-[11px] font-extrabold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-750 transition"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => setShowAddPostMenu(!showAddPostMenu)}
                      className="col-span-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-2 text-center text-[11px] font-extrabold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-750 transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Post</span>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTouchEdit({ field: "isVerified", title: "Verification Status", type: "boolean", value: profile.isVerified });
                      }}
                      className="col-span-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-2 text-center text-[11px] font-extrabold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-750 transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                      <span>Verified</span>
                    </button>
                  </div>

                  {/* Highlights Circular Scroll list */}
                  {(profile.highlights.length > 0 || isInlineEditing) && (
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-850 flex gap-3.5 overflow-x-auto scrollbar-none text-center leading-tight select-none">
                      {profile.highlights.map(hl => (
                        <div 
                          key={hl.id} 
                          className="flex flex-col items-center shrink-0 cursor-pointer active:scale-95 transition relative"
                          onClick={(e) => {
                            if (isInlineEditing) {
                              e.stopPropagation();
                              const newCover = window.prompt("Enter new Highlight Cover Image URL:", hl.cover);
                              if (newCover) {
                                const updatedHls = profile.highlights.map(h => h.id === hl.id ? { ...h, cover: newCover } : h);
                                onUpdateProfile({ ...profile, highlights: updatedHls });
                              }
                            } else {
                              setActiveStory(hl);
                            }
                          }}
                        >
                          {isInlineEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedHls = profile.highlights.filter(h => h.id !== hl.id);
                                onUpdateProfile({ ...profile, highlights: updatedHls });
                              }}
                              className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 border border-white dark:border-black z-25 shadow hover:bg-rose-600 transition"
                              title="Delete Highlight"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <div className="p-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                            <img src={hl.cover} alt={hl.title} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-black" referrerPolicy="no-referrer" />
                          </div>
                          {isInlineEditing ? (
                            <input
                              type="text"
                              value={hl.title}
                              onChange={(e) => {
                                const updatedHls = profile.highlights.map(h => h.id === hl.id ? { ...h, title: e.target.value } : h);
                                onUpdateProfile({ ...profile, highlights: updatedHls });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-sky-50 dark:bg-zinc-800 border border-sky-300 dark:border-zinc-700 rounded text-[8px] text-center text-zinc-800 dark:text-zinc-150 font-bold focus:outline-none w-14 py-0.5 mt-1"
                            />
                          ) : (
                            <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold tracking-tight mt-1 max-w-[50px] truncate">{hl.title}</span>
                          )}
                        </div>
                      ))}
                      
                      {isInlineEditing && (
                        <div 
                          className="flex flex-col items-center shrink-0 cursor-pointer active:scale-95 transition"
                          onClick={() => {
                            const newHighlight: Highlight = {
                              id: `hl_${Date.now()}`,
                              title: "New Story",
                              cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop"
                            };
                            onUpdateProfile({
                              ...profile,
                              highlights: [...profile.highlights, newHighlight]
                            });
                          }}
                        >
                          <div className="p-0.5 rounded-full border border-dashed border-sky-400 dark:border-sky-500 bg-sky-50/50 dark:bg-zinc-900/50 flex items-center justify-center w-[54px] h-[54px]">
                            <Plus className="w-5 h-5 text-sky-500" />
                          </div>
                          <span className="text-[8px] text-sky-500 font-extrabold tracking-tight mt-1 uppercase">Add Story</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grid Tabs selection */}
                  <div className="flex border-b border-zinc-150 dark:border-zinc-850">
                    <button
                      onClick={() => onUpdateProfile({ ...profile, activeTab: "posts" })}
                      className={`flex-1 py-2 flex justify-center text-zinc-400 border-b-2 transition ${profile.activeTab === "posts" ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white" : "border-transparent"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateProfile({ ...profile, activeTab: "reels" })}
                      className={`flex-1 py-2 flex justify-center text-zinc-400 border-b-2 transition ${profile.activeTab === "reels" ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white" : "border-transparent"}`}
                    >
                      <Film className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateProfile({ ...profile, activeTab: "tagged" })}
                      className={`flex-1 py-2 flex justify-center text-zinc-400 border-b-2 transition ${profile.activeTab === "tagged" ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white" : "border-transparent"}`}
                    >
                      <UserSquare2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Grid Content Layout */}
                  {profile.activeTab === 'posts' && (
                    profile.posts.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 flex flex-col items-center">
                        <PlusSquare className="w-8 h-8 opacity-40 mb-1" />
                        <p className="text-[11px] font-bold">No Posts Yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-0.5 p-0.5">
                        {profile.posts.map(p => (
                          <div
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, p.id)}
                            onClick={() => onPostClick(p)}
                            className="aspect-square relative group bg-zinc-100 cursor-pointer overflow-hidden active:scale-98 transition select-none"
                          >
                            <img src={p.insights?.reelMediaUrl || p.mediaUrl} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Hover Details overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-xs font-bold select-none">
                              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-white" /> {formatCount(p.likes)}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 fill-white" /> {p.comments.length}</span>
                            </div>

                            {/* Post Type icon indicators in top-right of the box */}
                            {p.type === "carousel" && (
                              <div className="absolute top-1 right-1 bg-black/60 p-0.5 rounded text-white text-[8px]">
                                <Bookmark className="w-2.5 h-2.5 fill-white" />
                              </div>
                            )}
                            {p.type === "video" && (
                              <div className="absolute top-1 right-1 bg-black/60 p-0.5 rounded text-white text-[8px]">
                                <Tv className="w-2.5 h-2.5 fill-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* REELS TAB MOCKUP */}
                  {profile.activeTab === 'reels' && (
                    <div className="grid grid-cols-3 gap-0.5 p-0.5">
                      {profile.posts.filter(p => p.type === 'video').length === 0 ? (
                        <div className="col-span-3 py-12 text-center text-zinc-400 flex flex-col items-center">
                          <Film className="w-8 h-8 opacity-40 mb-1" />
                          <p className="text-[11px] font-bold">No Reels Yet</p>
                        </div>
                      ) : (
                        profile.posts.filter(p => p.type === 'video').map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => onPostClick(p)}
                            className="aspect-[9/16] relative bg-zinc-200 dark:bg-zinc-800 cursor-pointer overflow-hidden hover:opacity-95 transition"
                          >
                            <img src={p.insights?.reelMediaUrl || p.mediaUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute bottom-2 left-2 flex items-center gap-0.5 text-white text-[9px] font-bold">
                              <Eye className="w-3 h-3" />
                              <span>{formatCount(p.views || p.likes * 6)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAGGED POSTS TAB */}
                  {profile.activeTab === 'tagged' && (
                    profile.taggedPosts.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 flex flex-col items-center">
                        <UserSquare2 className="w-8 h-8 opacity-40 mb-1" />
                        <p className="text-[11px] font-bold">No Tagged Photos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-0.5 p-0.5">
                        {profile.taggedPosts.map(p => (
                          <div
                            key={p.id}
                            onClick={() => onPostClick(p)}
                            className="aspect-square relative group bg-zinc-100 cursor-pointer overflow-hidden active:scale-98 transition"
                          >
                            <img src={p.insights?.reelMediaUrl || p.mediaUrl} alt="Tagged Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-xs font-bold">
                              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-white" /> {formatCount(p.likes)}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 fill-white" /> {p.comments.length}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          </div>


          {/* 3. BOTTOM NAVIGATION BAR */}
          <div className="h-12 px-5 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between shrink-0 bg-white/95 dark:bg-zinc-900/95 z-20">
            <button onClick={() => setActiveNavTab('home')} className={`p-1 transition ${activeNavTab === 'home' ? 'text-indigo-600 dark:text-sky-400' : 'text-zinc-500'}`}>
              <Home className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveNavTab('search')} className={`p-1 transition ${activeNavTab === 'search' ? 'text-indigo-600 dark:text-sky-400' : 'text-zinc-500'}`}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveNavTab('create')} className={`p-1 transition ${activeNavTab === 'create' ? 'text-indigo-600 dark:text-sky-400' : 'text-zinc-500'}`}>
              <PlusSquare className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveNavTab('reels')} className={`p-1 transition ${activeNavTab === 'reels' ? 'text-indigo-600 dark:text-sky-400' : 'text-zinc-500'}`}>
              <Film className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveNavTab('profile')} className={`p-0.5 rounded-full border transition ${activeNavTab === 'profile' ? 'border-indigo-600 dark:border-sky-400 scale-105' : 'border-transparent'}`}>
              <img src={profile.profilePic} alt="me" className="w-5.5 h-5.5 rounded-full object-cover" referrerPolicy="no-referrer" />
            </button>
          </div>

        </div>

        {/* FULLSCREEN STORY MODAL (STORY PLAYER) */}
        {activeStory && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between p-4 text-white">
            
            {/* Top Stories Progress bar */}
            <div className="w-full flex gap-1 pt-1.5 shrink-0">
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${storyProgress}%` }}></div>
              </div>
            </div>

            {/* Story Header */}
            <div className="flex items-center justify-between pt-3 shrink-0">
              <div className="flex items-center gap-2">
                <img src={profile.profilePic} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-white/20" />
                <span className="font-bold text-xs">@{profile.username}</span>
                <span className="text-[10px] text-white/50">• {activeStory.title}</span>
              </div>
              <button onClick={() => setActiveStory(null)} className="text-white hover:opacity-80 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Full-height content */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4 rounded-xl">
              <img src={activeStory.cover} alt="Story Content" className="w-full h-full object-cover absolute inset-0 bg-zinc-950" referrerPolicy="no-referrer" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                Highlight: {activeStory.title}
              </div>
            </div>

            {/* Story footer interaction bar */}
            <div className="flex gap-3 pb-3 shrink-0 items-center">
              <div className="flex-1 bg-transparent border border-white/40 rounded-full px-4 py-2 text-xs text-white/60 text-left">
                Send message...
              </div>
              <Heart className="w-5 h-5 text-white shrink-0 cursor-pointer" />
              <Send className="w-5 h-5 text-white shrink-0 cursor-pointer" />
            </div>

          </div>
        )}

        {/* Touch-Optimized Bottom Sheet Drawer */}
        {activeTouchEdit && (
          <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.15)] z-40 p-5 space-y-4 animate-in slide-in-from-bottom duration-250 select-text">
            {/* Handle Bar Indicator */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-2" onClick={() => setActiveTouchEdit(null)}></div>
            
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{activeTouchEdit.title}</h3>
              <button onClick={() => setActiveTouchEdit(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeTouchEdit.type === "text" && (
                <input
                  type="text"
                  value={activeTouchEdit.value}
                  onChange={(e) => setActiveTouchEdit({ ...activeTouchEdit, value: e.target.value })}
                  className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  autoFocus
                />
              )}

              {activeTouchEdit.type === "textarea" && (
                <textarea
                  value={activeTouchEdit.value}
                  onChange={(e) => setActiveTouchEdit({ ...activeTouchEdit, value: e.target.value })}
                  rows={4}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
                  autoFocus
                />
              )}

              {activeTouchEdit.type === "number" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activeTouchEdit.value}
                      onChange={(e) => setActiveTouchEdit({ ...activeTouchEdit, value: e.target.value })}
                      className="flex-1 text-base bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-extrabold"
                      autoFocus
                    />
                  </div>
                  {/* Smart quick add controls */}
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-black">
                    <button onClick={() => setActiveTouchEdit({ ...activeTouchEdit, value: parseCleanInt(activeTouchEdit.value) + 1000 })} className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg active:scale-95 transition">+1K</button>
                    <button onClick={() => setActiveTouchEdit({ ...activeTouchEdit, value: parseCleanInt(activeTouchEdit.value) + 10000 })} className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg active:scale-95 transition">+10K</button>
                    <button onClick={() => setActiveTouchEdit({ ...activeTouchEdit, value: parseCleanInt(activeTouchEdit.value) + 100000 })} className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg active:scale-95 transition">+100K</button>
                    <button onClick={() => setActiveTouchEdit({ ...activeTouchEdit, value: parseCleanInt(activeTouchEdit.value) + 1000000 })} className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-lg active:scale-95 transition">+1M</button>
                  </div>
                </div>
              )}

              {activeTouchEdit.type === "boolean" && (
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Enabled Status</span>
                  <button 
                    onClick={() => setActiveTouchEdit({ ...activeTouchEdit, value: !activeTouchEdit.value })}
                    className={`px-4 py-1.5 rounded-full text-xs font-black text-white transition ${activeTouchEdit.value ? 'bg-indigo-600' : 'bg-zinc-400'}`}
                  >
                    {activeTouchEdit.value ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setActiveTouchEdit(null)} 
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-250 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 font-extrabold text-xs rounded-xl transition active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleTouchSave} 
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition active:scale-95 shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        )}

      </div>
  );
}
