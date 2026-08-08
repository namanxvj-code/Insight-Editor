import React, { useState } from "react";
import { Post, Insights } from "../types";
import { X, Play, Share2, Heart, MessageCircle, Bookmark, ArrowUpRight, Award, BarChart3, Users, Eye } from "lucide-react";
import { parseCleanInt } from "../utils";

interface InsightsModalProps {
  post: Post;
  username: string;
  onUpdateInsights: (newInsights: Insights) => void;
  onClose: () => void;
}

export default function InsightsModal({ post, username, onUpdateInsights, onClose }: InsightsModalProps) {
  const [insights, setInsights] = useState<Insights>({ ...post.insights });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateInsights(insights);
    setIsEditing(false);
  };

  const handleInputChange = (key: keyof Insights, value: any) => {
    setInsights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Derived calculations for realistic sub-metrics
  const nonFollowersReach = Math.round(insights.reach * 0.85);
  const followersReach = insights.reach - nonFollowersReach;
  const fromExplore = Math.round(insights.impressions * 0.72);
  const fromHome = Math.round(insights.impressions * 0.18);
  const fromProfile = Math.round(insights.impressions * 0.06);
  const fromOther = insights.impressions - fromExplore - fromHome - fromProfile;

  const demographicsWomenPercent = insights.demographicsWomenPercent ?? 54;
  const demographicsAge_18_24 = insights.demographicsAge_18_24 ?? 32;
  const demographicsAge_25_34 = insights.demographicsAge_25_34 ?? 48;
  const demographicsTopCity = insights.demographicsTopCity || "London";
  const demographicsTopCountry = insights.demographicsTopCountry || "United Kingdom";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-hidden" id="insights_modal_backdrop">
      <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Post Insights</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-400 transition"
            >
              {isEditing ? "Save Values" : "Edit Values"}
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-6">
          
          {/* Post Mini-Header */}
          <div className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl">
            <img src={post.mediaUrl} alt="Thumbnail" className="w-14 h-14 object-cover rounded-lg bg-zinc-200" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Published by @{username}</p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate mt-0.5">{post.caption || "No caption"}</p>
              <div className="flex gap-3 text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                <span className="capitalize">{post.type}</span>
                <span>•</span>
                <span>{post.uploadDate}</span>
              </div>
            </div>
          </div>

          {/* Edit Mode Panel */}
          {isEditing ? (
            <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50 p-4 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Configure Mock Analytics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Reach</label>
                  <input
                    type="text"
                    value={insights.reach}
                    onChange={(e) => handleInputChange("reach", parseCleanInt(e.target.value))}
                    className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Impressions</label>
                  <input
                    type="text"
                    value={insights.impressions}
                    onChange={(e) => handleInputChange("impressions", parseCleanInt(e.target.value))}
                    className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Accounts Engaged</label>
                  <input
                    type="text"
                    value={insights.accountsEngaged}
                    onChange={(e) => handleInputChange("accountsEngaged", parseCleanInt(e.target.value))}
                    className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Profile Visits</label>
                  <input
                    type="text"
                    value={insights.profileVisits}
                    onChange={(e) => handleInputChange("profileVisits", parseCleanInt(e.target.value))}
                    className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Follows</label>
                  <input
                    type="text"
                    value={insights.follows}
                    onChange={(e) => handleInputChange("follows", parseCleanInt(e.target.value))}
                    className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Website Taps</label>
                  <input
                    type="text"
                    value={insights.websiteTaps}
                    onChange={(e) => handleInputChange("websiteTaps", parseCleanInt(e.target.value))}
                    className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-sky-100 dark:border-sky-900/30 space-y-2">
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">Audience Demographics</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Gender (Women %)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={insights.demographicsWomenPercent ?? 54}
                      onChange={(e) => handleInputChange("demographicsWomenPercent", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Top City Location</label>
                    <input
                      type="text"
                      value={insights.demographicsTopCity ?? "London"}
                      onChange={(e) => handleInputChange("demographicsTopCity", e.target.value)}
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Top Country Location</label>
                    <input
                      type="text"
                      value={insights.demographicsTopCountry ?? "United Kingdom"}
                      onChange={(e) => handleInputChange("demographicsTopCountry", e.target.value)}
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Age 18-24 %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={insights.demographicsAge_18_24 ?? 32}
                      onChange={(e) => handleInputChange("demographicsAge_18_24", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Age 25-34 %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={insights.demographicsAge_25_34 ?? 48}
                      onChange={(e) => handleInputChange("demographicsAge_25_34", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>
              
              {post.type === "video" && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-sky-100 dark:border-sky-900/30">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Watch Time</label>
                    <input
                      type="text"
                      value={insights.watchTime}
                      onChange={(e) => handleInputChange("watchTime", e.target.value)}
                      placeholder="e.g., 14h 25m"
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Avg. Watch Time</label>
                    <input
                      type="text"
                      value={insights.avgWatchTime}
                      onChange={(e) => handleInputChange("avgWatchTime", e.target.value)}
                      placeholder="e.g., 0:18"
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleSave}
                className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition"
              >
                Apply Changes
              </button>
            </div>
          ) : null}

          {/* Core Summary Metrics (Overview) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Overview</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100">{insights.reach.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mt-1">Accounts reached</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100">{insights.accountsEngaged.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mt-1">Accounts engaged</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
                <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100">{insights.profileVisits.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mt-1">Profile visits</span>
              </div>
            </div>
          </div>

          {/* Reach Section Detail */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-500" />
                Accounts Reached
              </h4>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{insights.reach.toLocaleString()}</span>
            </div>

            {/* Reach ratio bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-sky-500 rounded-l" style={{ width: "15%" }}></div>
                <div className="h-full bg-indigo-400 rounded-r" style={{ width: "85%" }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-500 rounded-full inline-block"></span> Followers ({followersReach.toLocaleString()})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-400 rounded-full inline-block"></span> Non-followers ({nonFollowersReach.toLocaleString()})</span>
              </div>
            </div>

            {/* Impressions Breakdown */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl space-y-3">
              <div className="flex justify-between text-xs font-semibold text-zinc-500 border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
                <span>IMPRESSIONS SOURCE</span>
                <span>TOTAL</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-800 dark:text-zinc-200">
                <span className="text-zinc-500">Total Impressions</span>
                <span className="font-semibold">{insights.impressions.toLocaleString()}</span>
              </div>
              <div className="space-y-2 pl-2 border-l border-sky-400">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>From Explore</span>
                  <span>{fromExplore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>From Home</span>
                  <span>{fromHome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>From Profile</span>
                  <span>{fromProfile.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>From Other</span>
                  <span>{fromOther.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audience Demographics Section */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 pb-1">
              <Users className="w-4 h-4 text-purple-500" />
              Audience Demographics
            </h4>

            {/* Gender Split Graphic */}
            <div className="space-y-2 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                <span>GENDER SPLIT</span>
                <span className="text-zinc-400">Followers reached</span>
              </div>
              
              {/* Dual comparative bar */}
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-start pl-2 text-[9px] font-bold text-white transition-all duration-500" 
                  style={{ width: `${demographicsWomenPercent}%` }}
                >
                  {demographicsWomenPercent}%
                </div>
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 flex items-center justify-end pr-2 text-[9px] font-bold text-white transition-all duration-500" 
                  style={{ width: `${100 - demographicsWomenPercent}%` }}
                >
                  {100 - demographicsWomenPercent}%
                </div>
              </div>
              
              <div className="flex justify-between text-[11px] text-zinc-500 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-pink-400 rounded-full inline-block"></span> 
                  Women ({demographicsWomenPercent}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-sky-450 rounded-full inline-block"></span> 
                  Men ({100 - demographicsWomenPercent}%)
                </span>
              </div>
            </div>

            {/* Age Range Distribution */}
            <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>AGE RANGE</span>
                <span className="text-zinc-400">Distribution %</span>
              </div>
              
              <div className="space-y-2">
                {[
                  { label: "13–17", pct: 3 },
                  { label: "18–24", pct: demographicsAge_18_24 },
                  { label: "25–34", pct: demographicsAge_25_34 },
                  { label: "35–44", pct: Math.max(0, 100 - 3 - demographicsAge_18_24 - demographicsAge_25_34 - 4 - 2) },
                  { label: "45–54", pct: 4 },
                  { label: "55+", pct: 2 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium w-10 shrink-0">{item.label}</span>
                    <div className="flex-1 h-3.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-md overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-md transition-all duration-500"
                        style={{ width: `${Math.max(0, item.pct)}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold w-7 text-right">{Math.max(0, item.pct)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>TOP LOCATIONS</span>
                <span className="text-zinc-400">Cities & Countries</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Cities */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Top Cities</span>
                  {[
                    { name: demographicsTopCity, pct: 14 },
                    { name: "New York", pct: 11 },
                    { name: "Tokyo", pct: 8 },
                    { name: "Paris", pct: 6 },
                    { name: "Toronto", pct: 4 }
                  ].map((city, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[80px]">{city.name}</span>
                        <span className="font-bold text-zinc-500">{city.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: `${city.pct * 5}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Countries */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Top Countries</span>
                  {[
                    { name: demographicsTopCountry, pct: 28 },
                    { name: "United States", pct: 24 },
                    { name: "Japan", pct: 12 },
                    { name: "Canada", pct: 9 },
                    { name: "France", pct: 7 }
                  ].map((country, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[80px]">{country.name}</span>
                        <span className="font-bold text-zinc-500">{country.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${country.pct * 3}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Times Graphic */}
            <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                <span>ACTIVE TIMES (HOURS)</span>
                <span className="text-zinc-400">Peak follower activity</span>
              </div>
              
              <div className="h-20 flex items-end justify-between gap-1 pt-4 px-2">
                {[
                  { hour: "12am", val: 15 },
                  { hour: "3am", val: 8 },
                  { hour: "6am", val: 22 },
                  { hour: "9am", val: 55 },
                  { hour: "12pm", val: 78 },
                  { hour: "3pm", val: 85 },
                  { hour: "6pm", val: 98, active: true },
                  { hour: "9pm", val: 64 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        item.active 
                          ? "bg-gradient-to-t from-indigo-500 to-purple-600 shadow-sm animate-pulse" 
                          : "bg-sky-400 dark:bg-sky-500/80 hover:bg-sky-500"
                      }`}
                      style={{ height: `${item.val}%` }}
                      title={`${item.hour}: ${item.val}% activity`}
                    ></div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight scale-90 sm:scale-100">{item.hour}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engagements Details */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                Content Interactions
              </h4>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{insights.accountsEngaged.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500">Likes</span>
                  <span className="font-semibold text-sm">{post.likes.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500">Comments</span>
                  <span className="font-semibold text-sm">{post.comments.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center text-teal-500">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500">Shares</span>
                  <span className="font-semibold text-sm">{insights.shares.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500">Saves</span>
                  <span className="font-semibold text-sm">{insights.saves.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Actions Detail */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-sky-500" />
              Profile Activity
            </h4>
            
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/40">
                <span>Profile Visits</span>
                <span className="font-semibold">{insights.profileVisits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/40">
                <span>Follows</span>
                <span className="font-semibold">{insights.follows.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Website Taps</span>
                <span className="font-semibold">{insights.websiteTaps.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Reels / Video metrics (if post is video) */}
          {post.type === "video" && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-indigo-500" />
                Reels Performance
              </h4>
              
              <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/20 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Plays (Views)</span>
                  <span className="font-bold">{post.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300">
                  <span>Total Watch Time</span>
                  <span className="font-semibold">{insights.watchTime || "12h 45m"}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300">
                  <span>Average Watch Time</span>
                  <span className="font-semibold">{insights.avgWatchTime || "0:14"}</span>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition hover:opacity-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
