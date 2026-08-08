import React, { useState, useEffect, useRef } from "react";
import { Post, Insights } from "../types";
import { parseCleanInt } from "../utils";
import { recalculateDescendingPercentages } from "../utils/percentageAdjuster";
import { 
  ChevronLeft, ChevronRight, Info, Heart, MessageCircle, Repeat, Send, Bookmark, Play, 
  TrendingUp, MoreHorizontal, Sparkles, Camera, Plus, Check, Upload, Image as ImageIcon
} from "lucide-react";

interface ReelInsightsModalProps {
  post: Post;
  username: string;
  onUpdateInsights: (newInsights: Insights) => void;
  onClose: () => void;
}

// Inline Editable Helper Component
interface InlineEditableProps {
  value: string | number;
  onSave: (val: any) => void;
  type?: "text" | "number" | "textarea";
  className?: string;
  placeholder?: string;
  isEditMode?: boolean;
  onRequireEditMode?: () => void;
}

const InlineEditable: React.FC<InlineEditableProps> = ({
  value,
  onSave,
  type = "text",
  className = "",
  placeholder = "",
  isEditMode = false,
  onRequireEditMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string | number>(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    let finalValue = tempValue;
    if (type === "number" || typeof value === "number") {
      finalValue = parseCleanInt(tempValue);
    }
    onSave(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      handleBlur();
    }
  };

  const stopProp = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  if (isEditing && isEditMode) {
    if (type === "textarea") {
      return (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          placeholder={placeholder}
          className="bg-zinc-800 text-white rounded border border-zinc-700 p-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-xs text-left"
          onClick={stopProp}
          onMouseDown={stopProp}
          onTouchStart={stopProp}
        />
      );
    }
    return (
      <input
        type={type === "number" ? "text" : type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        placeholder={placeholder}
        className="bg-zinc-850 text-white rounded border border-zinc-700 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 text-center w-full min-w-[30px]"
        onClick={stopProp}
        onMouseDown={stopProp}
        onTouchStart={stopProp}
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditMode) {
          if (onRequireEditMode) onRequireEditMode();
        } else {
          setIsEditing(true);
        }
      }}
      onMouseDown={stopProp}
      onTouchStart={stopProp}
      className={`transition-all duration-150 inline-block ${
        isEditMode
          ? "cursor-pointer hover:bg-sky-950/60 rounded px-1 -mx-1 border-b border-dashed border-sky-400 text-sky-200"
          : "cursor-default hover:opacity-90"
      } ${className}`}
      title={isEditMode ? "Click to edit value" : "Click 'Edit Data' in header to enable inline editing"}
    >
      {value !== undefined && value !== null && value !== "" ? (
        value.toLocaleString()
      ) : (
        <span className="text-zinc-500 italic">{placeholder || "Edit"}</span>
      )}
    </span>
  );
};

// Smart helper to format Y-axis labels automatically from numbers
const formatSmartYLabel = (num: number): string => {
  if (isNaN(num) || num <= 0) return "0";
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "M";
  }
  if (num >= 10_000) {
    const val = num / 1_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K";
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K";
  }
  return Math.round(num).toLocaleString();
};

export default function ReelInsightsModal({ post, username, onUpdateInsights, onClose }: ReelInsightsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const [insights, setInsights] = useState<Insights>(() => {
    let savedLocal: Insights | undefined = undefined;
    try {
      const customSaved = localStorage.getItem("ig_reel_insights_saved");
      if (customSaved) {
        const parsedMap = JSON.parse(customSaved);
        if (parsedMap[post.id]) {
          savedLocal = parsedMap[post.id];
        }
      }
    } catch (e) {}

    const base = savedLocal || post.insights;
    return {
      ...base,
      likes: base.likes ?? (post.likes || 2487),
      shares: base.shares ?? (post.shares || 111),
      saves: base.saves ?? (post.saves || 164),
      views: base.views ?? post.views,
      profileVisits: base.profileVisits ?? 4,
      follows: base.follows ?? 0,
      reposts: base.reposts ?? 0,
      reelMediaUrl: base.reelMediaUrl || post.insights?.reelMediaUrl || post.mediaUrl,
      reelCaptionOverlay: base.reelCaptionOverlay || "POV: You failed in school",
      reelSends: base.reelSends ?? 1,
      reelCommentsCount: base.reelCommentsCount ?? post.comments.length,
      chartPointsAll: base.chartPointsAll || [0, 750, 1310, 1362, 1362, 1362],
      chartPointsFollowers: base.chartPointsFollowers || [0, 420, 780, 810, 810, 810],
      chartPointsNonFollowers: base.chartPointsNonFollowers || [0, 330, 530, 552, 552, 552],
      sectionTitleSummary: base.sectionTitleSummary || "Summary",
      sectionTitleViewsOverTime: base.sectionTitleViewsOverTime || "Views over time",
      sectionTitleEngagement: base.sectionTitleEngagement || "Interactions Summary",
      sectionTitleAudience: base.sectionTitleAudience || "Audience Demographics",
      labelViews: base.labelViews || "Views",
      labelAccountsReached: base.labelAccountsReached || "Accounts reached",
      labelAvgWatchTime: base.labelAvgWatchTime || "Average watch time",
      labelFollows: base.labelFollows || "Follows",
      titleReelInsightsHeader: base.titleReelInsightsHeader || "Reel insights",
      skipRate: base.skipRate || "44.5%",
      shareRate: base.shareRate || "0.1%",
      likeRate: base.likeRate || "5.1%",
      saveRate: base.saveRate || "1.1%",
      repostRate: base.repostRate || "0.2%",
      commentRate: base.commentRate || "0.0%",
      retentionPoints: base.retentionPoints || [100, 10, 5, 5, 5],
      retentionDuration: base.retentionDuration || "0:32",
      sourceReelsTab: base.sourceReelsTab || "73.8%",
      sourceProfile: base.sourceProfile || "18.4%",
      sourceFeed: base.sourceFeed || "7.8%"
    };
  });

  // Local tabs: 'overview' | 'engagement' | 'audience'
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'audience'>('overview');

  // Loading state when opening Reel Insights
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1.0s loading animation on open
    return () => clearTimeout(timer);
  }, []);

  // Chart view filter: 'all' | 'followers' | 'non-followers'
  const [chartFilter, setChartFilter] = useState<'all' | 'followers' | 'non-followers'>('all');

  // Audience details sub-filter: 'age' | 'country' | 'gender'
  const [audienceSubFilter, setAudienceSubFilter] = useState<'age' | 'country' | 'gender'>('age');

  // Long-press randomization logic for the graph
  const [isPressing, setIsPressing] = useState(false);
  const [isPressingRetention, setIsPressingRetention] = useState(false);
  const [isPressingSources, setIsPressingSources] = useState(false);
  const [isPressingAge, setIsPressingAge] = useState(false);
  const [isPressingWhoViewed, setIsPressingWhoViewed] = useState(false);
  const [isPressingCountry, setIsPressingCountry] = useState(false);
  const [isPressingGender, setIsPressingGender] = useState(false);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerRetentionRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerSourcesRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerAgeRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerWhoViewedRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerCountryRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerGenderRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to generate Age distribution where total sum is 100.0%, 18-24 or 25-34 is dominant, and 55-64 / 65+ can be 0.0%
  const generateAgePercentagesSum100 = (): string[] => {
    // Dominant age group: 1 (18-24) or 2 (25-34)
    const dominantIdx = Math.random() < 0.6 ? 2 : 1;
    const dominantVal = Math.floor((40 + Math.random() * 28) * 10) / 10; // 40.0% to 68.0%

    let remaining = Math.round((100.0 - dominantVal) * 10) / 10;

    // 65+ (index 6): 60% chance of 0.0%, otherwise 0.1% - 2.0%
    const v65 = Math.random() < 0.6 ? 0 : Math.floor((0.1 + Math.random() * 1.9) * 10) / 10;
    remaining = Math.round((remaining - v65) * 10) / 10;

    // 55-64 (index 5): 50% chance of 0.0%, otherwise 0.1% - 3.5%
    const v55 = Math.random() < 0.5 ? 0 : Math.floor((0.1 + Math.random() * 3.4) * 10) / 10;
    remaining = Math.round((remaining - v55) * 10) / 10;

    // Other active indices excluding dominant, 55-64, 65+
    const otherIndices = [0, 1, 2, 3, 4].filter(i => i !== dominantIdx);

    let rawWeights = otherIndices.map(() => Math.random() * 40 + 5);
    let totalWeight = rawWeights.reduce((a, b) => a + b, 0);

    let otherVals = rawWeights.map(w => Math.floor(((w / totalWeight) * remaining) * 10) / 10);

    const maxOther = dominantVal - 2.0;
    for (let i = 0; i < otherVals.length; i++) {
      if (otherVals[i] > maxOther) {
        otherVals[i] = Math.max(0, Math.floor(maxOther * 10) / 10);
      }
    }

    let sumOthers = Math.round(otherVals.reduce((a, b) => a + b, 0) * 10) / 10;
    let diff = Math.round((remaining - sumOthers) * 10) / 10;

    otherVals[0] = Math.max(0, Math.round((otherVals[0] + diff) * 10) / 10);
    if (otherVals[0] > maxOther) {
      const overflow = Math.round((otherVals[0] - maxOther) * 10) / 10;
      otherVals[0] = Math.max(0, Math.floor(maxOther * 10) / 10);
      otherVals[1] = Math.max(0, Math.round((otherVals[1] + overflow) * 10) / 10);
    }

    let finalVals = [0, 0, 0, 0, 0, 0, 0];
    finalVals[dominantIdx] = dominantVal;
    finalVals[5] = v55;
    finalVals[6] = v65;
    otherIndices.forEach((idx, i) => {
      finalVals[idx] = otherVals[i];
    });

    let totalSum = Math.round(finalVals.reduce((a, b) => a + b, 0) * 10) / 10;
    if (totalSum !== 100.0) {
      const fixDiff = Math.round((100.0 - totalSum) * 10) / 10;
      finalVals[dominantIdx] = Math.round((finalVals[dominantIdx] + fixDiff) * 10) / 10;
    }

    return finalVals.map(v => `${v.toFixed(1)}%`);
  };

  // Helper to generate N percentages in strictly descending order that sum to exactly 100.0%
  const generateDescendingPercentagesSum100 = (count: number): string[] => {
    if (count <= 0) return [];
    if (count === 1) return ["100.0%"];

    // Generate count positive random numbers
    let weights = Array.from({ length: count }, () => Math.random() * 80 + 5);
    weights.sort((a, b) => b - a);

    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let values = weights.map(w => Math.floor(((w / totalWeight) * 100) * 10) / 10);

    // Ensure strict descending order (each element at least 0.1 larger than next)
    for (let i = values.length - 2; i >= 0; i--) {
      if (values[i] <= values[i + 1]) {
        values[i] = Math.round((values[i + 1] + 0.1) * 10) / 10;
      }
    }

    let currentSum = Math.round(values.reduce((s, v) => s + v, 0) * 10) / 10;
    let diff = Math.round((100.0 - currentSum) * 10) / 10;

    values[0] = Math.round((values[0] + diff) * 10) / 10;

    // Check strict descending order after diff adjustment
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] <= values[i + 1]) {
        const minRequired = Math.round((values[i + 1] + 0.1) * 10) / 10;
        const extraNeeded = Math.round((minRequired - values[i]) * 10) / 10;
        values[i] = minRequired;
        values[values.length - 1] = Math.round((values[values.length - 1] - extraNeeded) * 10) / 10;
      }
    }

    return values.map(v => `${v.toFixed(1)}%`);
  };

  const handleRandomizeGraphAndImpacts = () => {
    const peak = Math.floor(Math.random() * 800) + 1200; // Peak value between 1200 and 2000
    const pt1 = 0;
    const pt2 = Math.floor(peak * (0.3 + Math.random() * 0.25)); 
    const pt3 = Math.floor(peak * (0.65 + Math.random() * 0.25)); 
    const pt4 = Math.floor(peak * (0.9 + Math.random() * 0.1)); 
    const pt5 = Math.floor(peak * (0.95 + Math.random() * 0.05));
    const pt6 = peak;

    const chartPointsAll = [pt1, pt2, pt3, pt4, pt5, pt6];
    const chartPointsFollowers = chartPointsAll.map(p => Math.floor(p * (0.45 + Math.random() * 0.15)));
    const chartPointsNonFollowers = chartPointsAll.map((p, idx) => p - chartPointsFollowers[idx]);

    const randomSkipRate = `${(35 + Math.random() * 20).toFixed(1)}%`;
    const randomShareRate = `${(0.1 + Math.random() * 0.8).toFixed(1)}%`;
    const randomLikeRate = `${(3.0 + Math.random() * 6.0).toFixed(1)}%`;
    const randomSaveRate = `${(0.5 + Math.random() * 2.5).toFixed(1)}%`;
    const randomRepostRate = `${(0.05 + Math.random() * 0.35).toFixed(2)}%`;
    const randomCommentRate = `${(0.0 + Math.random() * 0.6).toFixed(1)}%`;

    triggerUpdate({
      chartPointsAll,
      chartPointsFollowers,
      chartPointsNonFollowers,
      skipRate: randomSkipRate,
      shareRate: randomShareRate,
      likeRate: randomLikeRate,
      saveRate: randomSaveRate,
      repostRate: randomRepostRate,
      commentRate: randomCommentRate
    });
  };

  const handleRandomizeRetentionOnly = () => {
    const p1 = 100;
    const p2 = Math.floor(Math.random() * 25) + 60; // 60% - 84%
    const p3 = Math.floor(Math.random() * 25) + 30; // 30% - 54%
    const p4 = Math.floor(Math.random() * 15) + 12; // 12% - 26%
    const p5 = Math.floor(Math.random() * 8) + 2;   // 2% - 9%
    const randomRetentionPoints = [p1, p2, p3, p4, p5];

    triggerUpdate({
      retentionPoints: randomRetentionPoints
    });
  };

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressing(true);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      handleRandomizeGraphAndImpacts();
      setIsPressing(false);
    }, 3000); // 3 seconds
  };

  const endPress = () => {
    setIsPressing(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const startPressRetention = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressingRetention(true);
    if (pressTimerRetentionRef.current) clearTimeout(pressTimerRetentionRef.current);
    pressTimerRetentionRef.current = setTimeout(() => {
      handleRandomizeRetentionOnly();
      setIsPressingRetention(false);
    }, 3000); // 3 seconds
  };

  const endPressRetention = () => {
    setIsPressingRetention(false);
    if (pressTimerRetentionRef.current) {
      clearTimeout(pressTimerRetentionRef.current);
      pressTimerRetentionRef.current = null;
    }
  };

  const handleRandomizeSourcesDescending = () => {
    // Generate 4 percentages in strictly descending order that sum to 100.0%
    const [v1, v2, v3, v4] = generateDescendingPercentagesSum100(4);

    const updated = {
      ...insights,
      sourceReelsTab: v1,
      sourceExplore: v2,
      sourceProfile: v3,
      sourceFeed: v4
    };

    setInsights(updated);
    onUpdateInsights(updated);
  };

  const startPressSources = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressingSources(true);
    if (pressTimerSourcesRef.current) clearTimeout(pressTimerSourcesRef.current);
    pressTimerSourcesRef.current = setTimeout(() => {
      handleRandomizeSourcesDescending();
      setIsPressingSources(false);
    }, 3000); // 3 seconds
  };

  const endPressSources = () => {
    setIsPressingSources(false);
    if (pressTimerSourcesRef.current) {
      clearTimeout(pressTimerSourcesRef.current);
      pressTimerSourcesRef.current = null;
    }
  };

  const handleRandomizeAge = () => {
    // Generate 7 percentages that sum to 100.0% with dominant young adult peak and optional 0% for older groups
    const [v1, v2, v3, v4, v5, v6, v7] = generateAgePercentagesSum100();

    const updated = {
      ...insights,
      audienceAge_13_17: v1,
      audienceAge_18_24: v2,
      audienceAge_25_34: v3,
      audienceAge_35_44: v4,
      audienceAge_45_54: v5,
      audienceAge_55_64: v6,
      audienceAge_65_plus: v7
    };

    setInsights(updated);
    onUpdateInsights(updated);
  };

  const startPressAge = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressingAge(true);
    if (pressTimerAgeRef.current) clearTimeout(pressTimerAgeRef.current);
    pressTimerAgeRef.current = setTimeout(() => {
      handleRandomizeAge();
      setIsPressingAge(false);
    }, 3000); // 3 seconds
  };

  const endPressAge = () => {
    setIsPressingAge(false);
    if (pressTimerAgeRef.current) {
      clearTimeout(pressTimerAgeRef.current);
      pressTimerAgeRef.current = null;
    }
  };

  const handleRandomizeWhoViewedDescending = () => {
    // Generate 2 percentages in strictly descending order that sum to 100.0%
    const [v1, v2] = generateDescendingPercentagesSum100(2);

    const updated = {
      ...insights,
      whoViewedFollowersPercent: v1,
      whoViewedNonFollowersPercent: v2
    };

    setInsights(updated);
    onUpdateInsights(updated);
  };

  const startPressWhoViewed = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressingWhoViewed(true);
    if (pressTimerWhoViewedRef.current) clearTimeout(pressTimerWhoViewedRef.current);
    pressTimerWhoViewedRef.current = setTimeout(() => {
      handleRandomizeWhoViewedDescending();
      setIsPressingWhoViewed(false);
    }, 3000); // 3 seconds
  };

  const endPressWhoViewed = () => {
    setIsPressingWhoViewed(false);
    if (pressTimerWhoViewedRef.current) {
      clearTimeout(pressTimerWhoViewedRef.current);
      pressTimerWhoViewedRef.current = null;
    }
  };

  const handleRandomizeCountryDescending = () => {
    // Generate 5 percentages in strictly descending order that sum to 100.0%
    const [v1, v2, v3, v4, v5] = generateDescendingPercentagesSum100(5);

    const updated = {
      ...insights,
      audienceCountry1_pct: v1,
      audienceCountry2_pct: v2,
      audienceCountry3_pct: v3,
      audienceCountry4_pct: v4,
      audienceCountry5_pct: v5
    };

    setInsights(updated);
    onUpdateInsights(updated);
  };

  const startPressCountry = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressingCountry(true);
    if (pressTimerCountryRef.current) clearTimeout(pressTimerCountryRef.current);
    pressTimerCountryRef.current = setTimeout(() => {
      handleRandomizeCountryDescending();
      setIsPressingCountry(false);
    }, 3000); // 3 seconds
  };

  const endPressCountry = () => {
    setIsPressingCountry(false);
    if (pressTimerCountryRef.current) {
      clearTimeout(pressTimerCountryRef.current);
      pressTimerCountryRef.current = null;
    }
  };

  const handleRandomizeGenderDescending = () => {
    // Generate 2 percentages in strictly descending order that sum to 100.0%
    const [v1, v2] = generateDescendingPercentagesSum100(2);

    const updated = {
      ...insights,
      audienceGenderWomenPercent: v1,
      audienceGenderMenPercent: v2
    };

    setInsights(updated);
    onUpdateInsights(updated);
  };

  const startPressGender = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    setIsPressingGender(true);
    if (pressTimerGenderRef.current) clearTimeout(pressTimerGenderRef.current);
    pressTimerGenderRef.current = setTimeout(() => {
      handleRandomizeGenderDescending();
      setIsPressingGender(false);
    }, 3000); // 3 seconds
  };

  const endPressGender = () => {
    setIsPressingGender(false);
    if (pressTimerGenderRef.current) {
      clearTimeout(pressTimerGenderRef.current);
      pressTimerGenderRef.current = null;
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (pressTimerRetentionRef.current) clearTimeout(pressTimerRetentionRef.current);
      if (pressTimerSourcesRef.current) clearTimeout(pressTimerSourcesRef.current);
      if (pressTimerAgeRef.current) clearTimeout(pressTimerAgeRef.current);
      if (pressTimerWhoViewedRef.current) clearTimeout(pressTimerWhoViewedRef.current);
      if (pressTimerCountryRef.current) clearTimeout(pressTimerCountryRef.current);
      if (pressTimerGenderRef.current) clearTimeout(pressTimerGenderRef.current);
    };
  }, []);

  // Time & Status bar state
  const [statusBarTime, setStatusBarTime] = useState("4:30");
  const [isEditingMediaUrl, setIsEditingMediaUrl] = useState(false);
  const [tempMediaUrl, setTempMediaUrl] = useState(post.insights.reelMediaUrl || post.mediaUrl);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditMode) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (rawDataUrl) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
              setTempMediaUrl(compressedDataUrl);
              handleSaveField("reelMediaUrl", compressedDataUrl);
            } else {
              setTempMediaUrl(rawDataUrl);
              handleSaveField("reelMediaUrl", rawDataUrl);
            }
            setIsEditingMediaUrl(false);
          };
          img.onerror = () => {
            setTempMediaUrl(rawDataUrl);
            handleSaveField("reelMediaUrl", rawDataUrl);
            setIsEditingMediaUrl(false);
          };
          img.src = rawDataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpdate = (updatedFields: Partial<Insights>) => {
    const updated = {
      ...insights,
      ...updatedFields
    };
    setInsights(updated);
    onUpdateInsights(updated);
    try {
      const customSaved = localStorage.getItem("ig_reel_insights_saved") || "{}";
      let parsedMap: Record<string, any> = {};
      try {
        parsedMap = JSON.parse(customSaved);
      } catch (e) {
        parsedMap = {};
      }
      parsedMap[post.id] = updated;

      try {
        localStorage.setItem("ig_reel_insights_saved", JSON.stringify(parsedMap));
      } catch (storageErr) {
        // Handle storage quota exceeded cleanly
        const lightweightMap = { ...parsedMap };
        Object.keys(lightweightMap).forEach((key) => {
          if (key !== post.id && lightweightMap[key]?.reelMediaUrl?.startsWith("data:")) {
            lightweightMap[key] = { ...lightweightMap[key], reelMediaUrl: undefined };
          }
        });
        try {
          localStorage.setItem("ig_reel_insights_saved", JSON.stringify(lightweightMap));
        } catch (e2) {
          const currentWithoutHeavyData = {
            ...updated,
            reelMediaUrl: updated.reelMediaUrl?.startsWith("data:") ? undefined : updated.reelMediaUrl
          };
          const minimalMap = { [post.id]: currentWithoutHeavyData };
          try {
            localStorage.setItem("ig_reel_insights_saved", JSON.stringify(minimalMap));
          } catch (e3) {
            // Graceful fallback if browser localStorage is completely full
          }
        }
      }
    } catch (err) {
      // Ignored
    }
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Save data permanently on toggle off
      triggerUpdate({});
      setIsEditMode(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } else {
      setIsEditMode(true);
    }
  };

  // Synchronize counts with top level when insights change
  const handleSaveField = (key: keyof Insights, val: any) => {
    const numericKeys = [
      'views', 'reach', 'follows', 'impressions', 'accountsEngaged', 
      'profileVisits', 'websiteTaps', 'shares', 'saves', 
      'reelCommentsCount', 'reelSends', 'likes'
    ];
    let finalVal = val;
    if (numericKeys.includes(key as string)) {
      finalVal = parseCleanInt(val);
    }

    if (key === 'views') {
      const numViews = typeof finalVal === 'number' ? finalVal : parseCleanInt(finalVal);
      const chartMaxLabel = formatSmartYLabel(numViews);
      const chartMidLabel = formatSmartYLabel(numViews / 2);
      const chartMinLabel = "0";

      const pt1 = 0;
      const pt2 = Math.round(numViews * 0.25);
      const pt3 = Math.round(numViews * 0.65);
      const pt4 = Math.round(numViews * 0.88);
      const pt5 = Math.round(numViews * 0.96);
      const pt6 = numViews;

      const chartPointsAll = [pt1, pt2, pt3, pt4, pt5, pt6];
      const chartPointsFollowers = chartPointsAll.map(p => Math.round(p * 0.55));
      const chartPointsNonFollowers = chartPointsAll.map((p, idx) => p - chartPointsFollowers[idx]);

      triggerUpdate({
        views: numViews,
        chartMaxLabel,
        chartMidLabel,
        chartMinLabel,
        chartPointsAll,
        chartPointsFollowers,
        chartPointsNonFollowers
      });
      return;
    }

    // --- SMART AUTO-ADJUSTMENT FOR PERCENTAGE CHARTS (TOP BAR EDITED) ---

    // 1. Top sources of views (4 bars: Reels tab, Explore, Profile, Feed)
    if (key === 'sourceReelsTab') {
      const [v1, v2, v3, v4] = recalculateDescendingPercentages(val, 4, 1, true);
      triggerUpdate({
        sourceReelsTab: v1,
        sourceExplore: v2,
        sourceProfile: v3,
        sourceFeed: v4
      });
      return;
    }

    // 2. Who viewed your reel (2 bars: Followers, Non-followers)
    if (key === 'whoViewedFollowersPercent') {
      const [v1, v2] = recalculateDescendingPercentages(val, 2, 1, true);
      triggerUpdate({
        whoViewedFollowersPercent: v1,
        whoViewedNonFollowersPercent: v2
      });
      return;
    }

    // 3. Audience details - Age (7 bars: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
    if (key === 'audienceAge_13_17') {
      const [v1, v2, v3, v4, v5, v6, v7] = recalculateDescendingPercentages(val, 7, 1, true);
      triggerUpdate({
        audienceAge_13_17: v1,
        audienceAge_18_24: v2,
        audienceAge_25_34: v3,
        audienceAge_35_44: v4,
        audienceAge_45_54: v5,
        audienceAge_55_64: v6,
        audienceAge_65_plus: v7
      });
      return;
    }

    // 4. Audience details - Country (5 bars: Country 1 to 5)
    if (key === 'audienceCountry1_pct') {
      const [v1, v2, v3, v4, v5] = recalculateDescendingPercentages(val, 5, 1, true);
      triggerUpdate({
        audienceCountry1_pct: v1,
        audienceCountry2_pct: v2,
        audienceCountry3_pct: v3,
        audienceCountry4_pct: v4,
        audienceCountry5_pct: v5
      });
      return;
    }

    // 5. Audience details - Gender (2 bars: Men, Women)
    if (key === 'audienceGenderMenPercent') {
      const [v1, v2] = recalculateDescendingPercentages(val, 2, 1, true);
      triggerUpdate({
        audienceGenderMenPercent: v1,
        audienceGenderWomenPercent: v2
      });
      return;
    }

    triggerUpdate({ [key]: finalVal });
  };

  const EditField: React.FC<Omit<InlineEditableProps, 'isEditMode' | 'onRequireEditMode'>> = (props) => (
    <InlineEditable
      {...props}
      isEditMode={isEditMode}
    />
  );

  // Gender Split computations
  const womenPct = insights.demographicsWomenPercent ?? 54;
  const menPct = 100 - womenPct;

  // Age Distribution values
  const age_18_24 = insights.demographicsAge_18_24 ?? 32;
  const age_25_34 = insights.demographicsAge_25_34 ?? 48;
  const age_35_44 = Math.max(0, 100 - 3 - age_18_24 - age_25_34 - 4 - 2);

  // Top locations
  const topCity = insights.demographicsTopCity || "London";
  const topCountry = insights.demographicsTopCountry || "United Kingdom";

  // Chart data resolution
  const activeChartPoints = chartFilter === 'all' 
    ? insights.chartPointsAll || [] 
    : chartFilter === 'followers' 
      ? insights.chartPointsFollowers || [] 
      : insights.chartPointsNonFollowers || [];

  const handleUpdateChartPoint = (idx: number, newVal: number) => {
    const pointsCopy = [...activeChartPoints];
    pointsCopy[idx] = newVal;
    if (chartFilter === 'all') {
      triggerUpdate({ chartPointsAll: pointsCopy });
    } else if (chartFilter === 'followers') {
      triggerUpdate({ chartPointsFollowers: pointsCopy });
    } else {
      triggerUpdate({ chartPointsNonFollowers: pointsCopy });
    }
  };

  // Render SVG Path line for view points
  const renderChartLine = () => {
    if (!activeChartPoints || activeChartPoints.length === 0) return null;
    const maxVal = Math.max(...activeChartPoints, 100) * 1.15;
    const width = 320;
    const height = 120;
    const pointsCount = activeChartPoints.length;
    
    const startX = 45;
    const endX = 310;
    const startY = 15;
    const endY = 95;

    const coordinates = activeChartPoints.map((val, idx) => {
      const x = startX + (idx / (pointsCount - 1)) * (endX - startX);
      const y = endY - (val / maxVal) * (endY - startY);
      return { x, y };
    });

    let dPath = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 1; i < coordinates.length; i++) {
      dPath += ` L ${coordinates[i].x} ${coordinates[i].y}`;
    }

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal grid lines */}
        <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="#1a1c22" strokeWidth="1" />
        <line x1={startX} y1={(startY + endY) / 2} x2={endX} y2={(startY + endY) / 2} stroke="#1a1c22" strokeWidth="1" />
        <line x1={startX} y1={endY} x2={endX} y2={endY} stroke="#1a1c22" strokeWidth="1" />

        {/* Y-axis Labels */}
        <foreignObject x="0" y={startY - 8} width="44" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center">
            {isLoading ? (
              <span className="w-6 h-2.5 bg-zinc-800 animate-pulse rounded inline-block" />
            ) : (
              <EditField
                value={insights.chartMaxLabel || "1.5K"}
                onSave={(val) => handleSaveField("chartMaxLabel", val)}
                className="text-[10px] font-semibold text-zinc-500 animate-fadeIn"
              />
            )}
          </div>
        </foreignObject>
        <foreignObject x="0" y={(startY + endY) / 2 - 8} width="44" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center">
            {isLoading ? (
              <span className="w-5 h-2.5 bg-zinc-800 animate-pulse rounded inline-block" />
            ) : (
              <EditField
                value={insights.chartMidLabel || "750"}
                onSave={(val) => handleSaveField("chartMidLabel", val)}
                className="text-[10px] font-semibold text-zinc-500 animate-fadeIn"
              />
            )}
          </div>
        </foreignObject>
        <foreignObject x="0" y={endY - 8} width="44" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center">
            {isLoading ? (
              <span className="w-3 h-2.5 bg-zinc-800 animate-pulse rounded inline-block" />
            ) : (
              <EditField
                value={insights.chartMinLabel || "0"}
                onSave={(val) => handleSaveField("chartMinLabel", val)}
                className="text-[10px] font-semibold text-zinc-500 animate-fadeIn"
              />
            )}
          </div>
        </foreignObject>

        {/* The glowing pink/magenta line */}
        <path 
          d={dPath} 
          fill="none" 
          stroke={isLoading ? "#3f3f46" : "#e02489"} 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={isLoading ? "animate-pulse opacity-40" : "animate-fadeIn"}
        />

        {/* X-axis labels at bottom */}
        <foreignObject x={startX - 5} y={height - 22} width="65" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center justify-start">
            <EditField
              value={insights.chartDateStart || "Jul 16"}
              onSave={(val) => handleSaveField("chartDateStart", val)}
              className="text-[10px] font-semibold text-zinc-500 text-left"
            />
          </div>
        </foreignObject>
        <foreignObject x={(startX + endX) / 2 - 32} y={height - 22} width="65" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center justify-center">
            <EditField
              value={insights.chartDateMid || "Jul 18"}
              onSave={(val) => handleSaveField("chartDateMid", val)}
              className="text-[10px] font-semibold text-zinc-500 text-center"
            />
          </div>
        </foreignObject>
        <foreignObject x={endX - 60} y={height - 22} width="65" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center justify-end">
            <EditField
              value={insights.chartDateEnd || "Jul 20"}
              onSave={(val) => handleSaveField("chartDateEnd", val)}
              className="text-[10px] font-semibold text-zinc-500 text-right"
            />
          </div>
        </foreignObject>
      </svg>
    );
  };

  const renderRetentionLine = () => {
    const retentionPoints = insights.retentionPoints || [100, 10, 5, 5, 5];
    const width = 320;
    const height = 110;
    const startX = 45;
    const endX = 310;
    const startY = 15;
    const endY = 85;

    const coordinates = retentionPoints.map((val, idx) => {
      const x = startX + (idx / (retentionPoints.length - 1)) * (endX - startX);
      const y = endY - (val / 100) * (endY - startY);
      return { x, y };
    });

    let dPath = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 1; i < coordinates.length; i++) {
      dPath += ` L ${coordinates[i].x} ${coordinates[i].y}`;
    }

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal grid lines */}
        <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="#1a1c22" strokeWidth="1" />
        <line x1={startX} y1={(startY + endY) / 2} x2={endX} y2={(startY + endY) / 2} stroke="#1a1c22" strokeWidth="1" />
        <line x1={startX} y1={endY} x2={endX} y2={endY} stroke="#1a1c22" strokeWidth="1" />

        {/* Y-axis Labels */}
        <foreignObject x="0" y={startY - 8} width="44" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center">
            {isLoading ? (
              <span className="w-6 h-2.5 bg-zinc-800 animate-pulse rounded inline-block" />
            ) : (
              <EditField
                value={insights.retentionMaxLabel || "100%"}
                onSave={(val) => handleSaveField("retentionMaxLabel", val)}
                className="text-[10px] font-semibold text-zinc-500 animate-fadeIn"
              />
            )}
          </div>
        </foreignObject>
        <foreignObject x="0" y={(startY + endY) / 2 - 8} width="44" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center">
            {isLoading ? (
              <span className="w-5 h-2.5 bg-zinc-800 animate-pulse rounded inline-block" />
            ) : (
              <EditField
                value={insights.retentionMidLabel || "50%"}
                onSave={(val) => handleSaveField("retentionMidLabel", val)}
                className="text-[10px] font-semibold text-zinc-500 animate-fadeIn"
              />
            )}
          </div>
        </foreignObject>
        <foreignObject x="0" y={endY - 8} width="44" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center">
            {isLoading ? (
              <span className="w-3 h-2.5 bg-zinc-800 animate-pulse rounded inline-block" />
            ) : (
              <EditField
                value={insights.retentionMinLabel || "0"}
                onSave={(val) => handleSaveField("retentionMinLabel", val)}
                className="text-[10px] font-semibold text-zinc-500 animate-fadeIn"
              />
            )}
          </div>
        </foreignObject>

        {/* The glowing pink/magenta line */}
        <path 
          d={dPath} 
          fill="none" 
          stroke={isLoading ? "#3f3f46" : "#e02489"} 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={isLoading ? "animate-pulse opacity-40" : "animate-fadeIn"}
        />

        {/* X-axis labels at bottom */}
        <foreignObject x={startX - 5} y={height - 22} width="65" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center justify-start">
            <EditField
              value={insights.retentionStartTime || "0:00"}
              onSave={(val) => handleSaveField("retentionStartTime", val)}
              className="text-[10px] font-semibold text-zinc-500 text-left"
            />
          </div>
        </foreignObject>
        <foreignObject x={endX - 70} y={height - 22} width="75" height="22" className="overflow-visible pointer-events-auto">
          <div className="flex items-center justify-end">
            <EditField
              value={insights.retentionDuration || "0:32"}
              onSave={(val) => handleSaveField("retentionDuration", val)}
              className="text-[10px] font-semibold text-zinc-500 text-right"
            />
          </div>
        </foreignObject>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#0B1014]/90 z-50 flex items-center justify-center p-0 sm:p-3 backdrop-blur-md overflow-hidden" id="reel_insights_root">
      
      {/* Dynamic Universal Mobile Container (iOS & Android compatible) */}
      <div className="relative bg-[#0B1014] text-white rounded-none sm:rounded-[36px] border-0 sm:border-2 md:border-4 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.85)] max-w-full sm:max-w-[410px] w-full h-[100dvh] sm:h-[850px] sm:max-h-[92vh] flex flex-col overflow-hidden select-none">
        
        {/* TOP NAVIGATION HEADER BAR */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-900/70 shrink-0 relative">
          {/* Back button circular chevron */}
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center border border-zinc-800/40 active:scale-95 z-10"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Central Header title */}
          <div className="absolute left-1/2 -translate-x-1/2 font-extrabold text-base tracking-tight text-zinc-100 flex items-center justify-center z-0">
            <EditField 
              value={insights.titleReelInsightsHeader || "Reel insights"} 
              onSave={(val) => handleSaveField("titleReelInsightsHeader", val)} 
              className="font-black text-center text-zinc-50"
            />
          </div>

          {/* Right Inline Edit Mode Toggle Button (Pill Capsule with TrendingUp & MoreHorizontal) */}
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={handleToggleEditMode}
              className={`flex items-center justify-between gap-6 px-4 py-2 rounded-full border transition-all active:scale-95 ${
                isEditMode 
                  ? "bg-[#161a22] border-sky-400 text-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.35)]" 
                  : "bg-[#121317] hover:bg-[#181a1f] border-[#2a2d35] text-white"
              }`}
              title={isEditMode ? "Click to Save Changes Permanently" : "Click to Enable Inline Editing Mode"}
            >
              <TrendingUp className={`w-[19px] h-[19px] stroke-[2.3] transition-colors ${isEditMode ? "text-sky-400" : "text-white"}`} />
              <MoreHorizontal className={`w-[19px] h-[19px] stroke-[2.3] transition-colors ${isEditMode ? "text-sky-400" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* Mode Notification Banner */}
        {isEditMode && (
          <div className="bg-sky-500/15 border-b border-sky-500/30 px-4 py-1.5 text-center text-[11px] font-bold text-sky-300 flex items-center justify-center gap-1.5 shrink-0 animate-fadeIn z-20">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Inline Editing Mode Active — Tap any value to edit</span>
          </div>
        )}

        {showSaveToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-1.5 text-center text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 shrink-0 animate-fadeIn z-20">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data saved permanently!</span>
          </div>
        )}

        {/* SCROLLABLE INSTAGRAM BODY CANVAS */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none pb-12">
          
          {/* Hidden File Input for Gallery */}
          <input 
            type="file" 
            ref={galleryInputRef} 
            accept="image/*" 
            onChange={handleGalleryImageSelect} 
            className="hidden" 
          />

          {/* REEL PREVIEW 9:16 HIGH-FIDELITY CONTAINER */}
          <div className="flex justify-center py-2 shrink-0">
            {isLoading ? (
              <div className="w-[152px] h-[250px] rounded-[22px] bg-[#1c2026] animate-pulse border border-zinc-800/60 shadow-lg" />
            ) : (
              <div className="relative w-[152px] h-[250px] rounded-[22px] bg-black shadow-lg overflow-hidden border border-zinc-800/60 group animate-fadeIn">
                <img 
                  src={tempMediaUrl} 
                  alt="Reel Preview" 
                  className="w-full h-full object-cover brightness-[0.8] group-hover:brightness-[0.55] transition duration-200"
                  referrerPolicy="no-referrer"
                />

                {/* Editable URL / Gallery overlay input if clicked */}
                {isEditingMediaUrl ? (
                  <div className="absolute inset-0 bg-black/85 flex flex-col p-2.5 justify-center items-center gap-1.5 z-15">
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      From Gallery
                    </button>

                    <div className="flex items-center gap-1 w-full my-0.5">
                      <div className="h-[1px] bg-zinc-700 flex-1" />
                      <span className="text-[8px] font-bold text-zinc-400 uppercase">Or URL</span>
                      <div className="h-[1px] bg-zinc-700 flex-1" />
                    </div>

                    <input
                      type="text"
                      value={tempMediaUrl}
                      onChange={(e) => setTempMediaUrl(e.target.value)}
                      className="bg-zinc-800 text-[9px] text-white p-1 rounded border border-zinc-700 w-full text-center"
                      placeholder="https://..."
                    />
                    <div className="flex gap-1 w-full">
                      <button 
                        onClick={() => setIsEditingMediaUrl(false)}
                        className="flex-1 bg-zinc-800 text-zinc-300 text-[9px] py-1.5 rounded hover:bg-zinc-700 font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingMediaUrl(false);
                          handleSaveField("reelMediaUrl", tempMediaUrl);
                        }}
                        className="flex-1 bg-indigo-600 text-white text-[9px] py-1.5 rounded hover:bg-indigo-500 font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/50 cursor-pointer z-10 p-2"
                    onClick={() => galleryInputRef.current?.click()}
                    title="Click to select image from gallery"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        galleryInputRef.current?.click();
                      }}
                      className="w-full bg-pink-600 hover:bg-pink-500 text-white text-[9px] font-bold py-1.5 px-2 rounded-full flex items-center justify-center gap-1 shadow-lg active:scale-95 transition"
                    >
                      <Upload className="w-3 h-3 text-white" />
                      From Gallery
                    </button>
                  </div>
                )}

                {/* No text overlay on reel preview */}
              </div>
            )}
          </div>

          {/* DYNAMIC ACTION STATS INTERACTIVE ROW */}
          <div className="flex items-center justify-between px-2 py-2 bg-transparent">
            {[
              { icon: <Heart className="w-6 h-6 text-white stroke-[2]" />, label: "likes", key: "likes", val: insights.likes !== undefined ? insights.likes : post.likes },
              { icon: <MessageCircle className="w-6 h-6 text-white stroke-[2]" />, label: "comments", key: "reelCommentsCount", val: insights.reelCommentsCount },
              { icon: <Repeat className="w-6 h-6 text-white stroke-[2]" />, label: "shares", key: "shares", val: insights.shares !== undefined ? insights.shares : post.shares },
              { icon: <Send className="w-6 h-6 text-white stroke-[2] -rotate-12" />, label: "sends", key: "reelSends", val: insights.reelSends },
              { icon: <Bookmark className="w-6 h-6 text-white stroke-[2]" />, label: "saves", key: "saves", val: insights.saves !== undefined ? insights.saves : post.saves }
            ].map((action, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 py-1">
                <span className="hover:scale-105 transition duration-150 cursor-pointer">{action.icon}</span>
                <span className="text-xs font-semibold text-zinc-100 mt-1.5 min-h-[16px] flex items-center justify-center">
                  {isLoading ? (
                    <span className="w-7 h-3 bg-zinc-800 animate-pulse rounded my-0.5 inline-block" />
                  ) : (
                    <span className="animate-fadeIn">
                      <EditField
                        value={action.val}
                        onSave={(val) => handleSaveField(action.key as any, val)}
                        type="text"
                        className="font-bold text-xs text-center"
                      />
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* INSTAGRAM REEL TAB NAVIGATOR */}
          <div className="border-b border-zinc-900/60 flex relative select-none shrink-0">
            {[
              { id: "overview", label: "Overview" },
              { id: "engagement", label: "Engagement" },
              { id: "audience", label: "Audience" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 text-xs font-bold text-center transition-all duration-200 relative ${
                  activeTab === tab.id 
                    ? "text-white" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-fadeIn" />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT SPACE */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fadeIn pb-16">
              {/* Summary Section header */}
              <div className="flex items-center justify-between pb-1 select-none">
                <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <EditField
                    value={insights.sectionTitleSummary || "Summary"}
                    onSave={(val) => handleSaveField("sectionTitleSummary", val)}
                    className="font-extrabold text-base text-white"
                  />
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0" />
                </h4>
              </div>

              {/* 2x2 GRID OF INSIGHT CARDS */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "labelViews", defaultLabel: "Views", val: insights.views !== undefined ? insights.views : post.views, key: "views", labelText: insights.labelViews },
                  { label: "labelAccountsReached", defaultLabel: "Accounts reached", val: insights.reach !== undefined ? insights.reach : post.insights.reach, key: "reach", labelText: insights.labelAccountsReached },
                  { label: "labelAvgWatchTime", defaultLabel: "Average watch time", val: insights.avgWatchTime, key: "avgWatchTime", labelText: insights.labelAvgWatchTime, isString: true },
                  { label: "labelFollows", defaultLabel: "Follows", val: insights.follows !== undefined ? insights.follows : post.insights.follows, key: "follows", labelText: insights.labelFollows }
                ].map((card, idx) => (
                  <div key={idx} className="bg-[#202124] p-3.5 px-4 rounded-2xl flex flex-col justify-between text-left relative group transition duration-150">
                    {/* Inline Editable Label on Top Left */}
                    <span className="text-[11px] font-medium text-zinc-400 block leading-tight tracking-tight">
                      <EditField
                        value={card.labelText || card.defaultLabel}
                        onSave={(val) => handleSaveField(card.label as any, val)}
                        className="text-[11px] text-zinc-400 font-medium tracking-tight"
                      />
                    </span>
                    {/* Inline Editable Big bold value on Bottom Left */}
                    <span className="text-[18px] font-bold text-white block mt-2 leading-none min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-16 h-4.5 bg-zinc-800 animate-pulse rounded-md inline-block my-0.5" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={card.val}
                            onSave={(val) => handleSaveField(card.key as any, val)}
                            type={card.isString ? "text" : "number"}
                            className="text-[18px] font-bold text-white leading-none"
                          />
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Views over time graphical section */}
              <div className="space-y-4 pt-3 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-[15px] font-extrabold text-white flex items-center gap-1.5">
                    <EditField
                      value={insights.sectionTitleViewsOverTime || "Views over time"}
                      onSave={(val) => handleSaveField("sectionTitleViewsOverTime", val)}
                      className="font-extrabold text-[15px] text-white"
                    />
                    <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0" />
                  </h4>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 select-none shrink-0">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'followers', label: 'Followers' },
                    { id: 'non-followers', label: 'Non-followers' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setChartFilter(filter.id as any)}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-tight border transition-all ${
                        chartFilter === filter.id
                          ? "bg-white border-white text-black font-extrabold"
                          : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Custom SVG Line Chart - No separate background box */}
                <div 
                  className={`relative h-32 w-full select-none -mx-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isPressing ? "bg-pink-500/10 scale-[0.98] shadow-inner" : "hover:bg-white/5"
                  }`}
                  onMouseDown={startPress}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={startPress}
                  onTouchEnd={endPress}
                  onTouchCancel={endPress}
                  onContextMenu={(e) => e.preventDefault()}
                  title="Hold graph 3s to randomize chart & impact rates"
                >
                  {renderChartLine()}
                  {isPressing && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150">
                      <div className="bg-[#1e1e24] px-3.5 py-2 rounded-full text-[11px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                        Holding 3s to randomize chart & rates...
                      </div>
                    </div>
                  )}
                </div>


              </div>

              {/* What impacts your views section */}
              <div className="pt-5 border-t border-zinc-900/40 text-left">
                <div className="flex items-center justify-between pb-1 select-none">
                  <h4 className="text-[15px] font-extrabold text-white flex items-center gap-1.5">
                    What impacts your views
                    <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0" />
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium tracking-normal leading-tight">
                  Rates are listed in order of importance to reach.
                </p>

                <div className="mt-3 space-y-1">
                  {[
                    { 
                      label: "Skip rate", 
                      key: "skipRate", 
                      val: insights.skipRate || "44.5%", 
                      icon: (
                        <svg className="w-5 h-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      ) 
                    },
                    { 
                      label: "Share rate", 
                      key: "shareRate", 
                      val: insights.shareRate || "0.1%", 
                      icon: (
                        <svg className="w-5 h-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      ) 
                    },
                    { 
                      label: "Like rate", 
                      key: "likeRate", 
                      val: insights.likeRate || "5.1%", 
                      icon: <Heart className="w-5 h-5 text-zinc-300" /> 
                    },
                    { 
                      label: "Save rate", 
                      key: "saveRate", 
                      val: insights.saveRate || "1.1%", 
                      icon: <Bookmark className="w-5 h-5 text-zinc-300" /> 
                    },
                    { 
                      label: "Repost rate", 
                      key: "repostRate", 
                      val: insights.repostRate || "0.2%", 
                      icon: <Repeat className="w-5 h-5 text-zinc-300" /> 
                    },
                    { 
                      label: "Comment rate", 
                      key: "commentRate", 
                      val: insights.commentRate || "0.0%", 
                      icon: <MessageCircle className="w-5 h-5 text-zinc-300" /> 
                    }
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3.5">
                        <span className="w-11 h-11 rounded-full bg-[#1e2025] flex items-center justify-center">
                          {row.icon}
                        </span>
                        <span className="text-[14px] font-medium text-white tracking-wide">
                          {row.label}
                        </span>
                      </div>
                      <span className="text-[15px] font-bold text-white pr-1">
                        {isLoading ? (
                          <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                        ) : (
                          <span className="animate-fadeIn">
                            <EditField
                              value={row.val}
                              onSave={(val) => handleSaveField(row.key as any, val)}
                              className="text-[15px] font-bold text-white"
                            />
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: How long people watched your reel */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[16px] font-black text-white tracking-tight flex items-center gap-1.5">
                    How long people watched your reel
                    <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0" />
                  </h4>
                </div>

                {/* Vertical video/mockup player cover */}
                <div className="flex justify-center py-2 select-none">
                  <div className="relative w-[130px] h-[225px] bg-zinc-950 rounded-[20px] overflow-hidden border border-zinc-800 shadow-2xl flex flex-col items-center justify-center p-3.5">
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={insights.reelMediaUrl || post.mediaUrl} 
                        alt="Reel Cover" 
                        className="w-full h-full object-cover opacity-80" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/60" />
                    </div>

                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                      <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* SVG Retention Graph */}
                <div 
                  className={`relative h-28 w-full select-none -mx-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isPressingRetention ? "bg-pink-500/10 scale-[0.98] shadow-inner" : "hover:bg-white/5"
                  }`}
                  onMouseDown={startPressRetention}
                  onMouseUp={endPressRetention}
                  onMouseLeave={endPressRetention}
                  onTouchStart={startPressRetention}
                  onTouchEnd={endPressRetention}
                  onTouchCancel={endPressRetention}
                  onContextMenu={(e) => e.preventDefault()}
                  title="Hold graph 3s to randomize retention curve"
                >
                  {renderRetentionLine()}
                  {isPressingRetention && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150">
                      <div className="bg-[#1e1e24] px-3.5 py-2 rounded-full text-[11px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                        Holding 3s to randomize retention...
                      </div>
                    </div>
                  )}
                </div>


              </div>

              {/* SECTION: Top sources of views */}
              <div 
                className={`space-y-4 pt-3 pb-2 px-1 rounded-2xl border transition-all duration-300 relative select-none cursor-pointer ${
                  isPressingSources 
                    ? "bg-pink-500/10 border-pink-500/30 scale-[0.98] shadow-inner" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
                onMouseDown={startPressSources}
                onMouseUp={endPressSources}
                onMouseLeave={endPressSources}
                onTouchStart={startPressSources}
                onTouchEnd={endPressSources}
                onTouchCancel={endPressSources}
                onContextMenu={(e) => e.preventDefault()}
                title="Hold for 3s to randomize sources descendingly"
              >
                {isPressingSources && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150 z-20">
                    <div className="bg-[#1e1e24] px-4 py-2.5 rounded-full text-[12px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                      Holding 3s to randomize...
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 text-left">
                  <h4 className="text-[17px] font-bold text-white tracking-tight flex items-center gap-1.5">
                    <EditField
                      value={insights.sectionTitleTopSources || "Top sources of views"}
                      onSave={(val) => handleSaveField("sectionTitleTopSources", val)}
                      className="font-bold text-[17px] text-white"
                    />
                  </h4>
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0 ml-0.5" />
                </div>

                <div className="space-y-4">
                  {[
                    { label: insights.sourceReelsTabLabel || "Reels tab", labelKey: "sourceReelsTabLabel", key: "sourceReelsTab", val: insights.sourceReelsTab || "91.2%" },
                    { label: insights.sourceExploreLabel || "Explore", labelKey: "sourceExploreLabel", key: "sourceExplore", val: insights.sourceExplore || "6.9%" },
                    { label: insights.sourceProfileLabel || "Profile", labelKey: "sourceProfileLabel", key: "sourceProfile", val: insights.sourceProfile || "0.9%" },
                    { label: insights.sourceFeedLabel || "Feed", labelKey: "sourceFeedLabel", key: "sourceFeed", val: insights.sourceFeed || "0.5%" }
                  ].map((source, idx) => {
                    const percentVal = parseFloat(source.val) || 0;
                    return (
                      <div key={idx} className="space-y-1.5 text-left">
                        <div className="text-[15px] font-normal text-white">
                          <EditField
                            value={source.label}
                            onSave={(val) => handleSaveField(source.labelKey as any, val)}
                            className="text-[15px] font-normal text-white"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-[5px] bg-[#222226] rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-[#f000b8] rounded-full transition-all duration-500 ${isLoading ? "animate-pulse opacity-40" : ""}`} 
                              style={{ width: `${Math.min(100, Math.max(0, percentVal))}%` }}
                            />
                          </div>
                          <div className="text-[15px] font-semibold text-white min-w-[48px] text-right shrink-0">
                            {isLoading ? (
                              <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                            ) : (
                              <span className="animate-fadeIn">
                                <EditField
                                  value={source.val}
                                  onSave={(val) => handleSaveField(source.key as any, val)}
                                  className="text-[15px] font-semibold text-white"
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ad & Boost Section */}
              <div className="pt-1 pb-2 text-left px-1">
                <h4 className="text-[17px] font-bold text-white tracking-tight mb-2">
                  Ad
                </h4>
                <div className="flex items-center justify-between py-2 text-white cursor-pointer active:opacity-70 transition">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-white stroke-[2.2]" />
                    <span className="text-[15px] font-medium text-white">
                      Boost this reel
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-6 animate-fadeIn text-left px-1 py-1 pb-20">
              {/* 1. ACTIONS AFTER VIEWING */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[17px] font-bold text-white tracking-tight">
                    Actions after viewing
                  </h4>
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0 ml-0.5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Profile visits</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-8 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.profileVisits ?? 4}
                            onSave={(val) => handleSaveField("profileVisits", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Follows</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-8 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.follows ?? 0}
                            onSave={(val) => handleSaveField("follows", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. INTERACTIONS */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[17px] font-bold text-white tracking-tight">
                    Interactions
                  </h4>
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0 ml-0.5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Likes</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.likes !== undefined ? insights.likes : (post.likes || 2487)}
                            onSave={(val) => handleSaveField("likes", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Comments</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-8 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.reelCommentsCount ?? 0}
                            onSave={(val) => handleSaveField("reelCommentsCount", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Reposts</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-8 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.reposts ?? 0}
                            onSave={(val) => handleSaveField("reposts", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Shares</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.shares !== undefined ? insights.shares : (post.shares || 111)}
                            onSave={(val) => handleSaveField("shares", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] font-normal text-white">Saves</span>
                    <span className="text-[15px] font-bold text-white min-h-[22px] flex items-center">
                      {isLoading ? (
                        <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                      ) : (
                        <span className="animate-fadeIn">
                          <EditField
                            value={insights.saves !== undefined ? insights.saves : (post.saves || 164)}
                            onSave={(val) => handleSaveField("saves", val)}
                            type="number"
                            className="text-[15px] font-bold text-white"
                          />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. WHEN PEOPLE LIKED YOUR REEL */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[17px] font-bold text-white tracking-tight">
                    When people liked your reel
                  </h4>
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0 ml-0.5" />
                </div>

                <div className="pt-2 relative space-y-10 select-none">
                  {/* Top grid line */}
                  <div className="relative flex items-center gap-3">
                    <span className="text-[13px] font-medium text-zinc-500 w-4 text-center shrink-0">--</span>
                    <div className="flex-1 h-[1px] bg-zinc-800/80"></div>
                  </div>

                  {/* Middle grid line with text */}
                  <div className="relative flex items-center gap-3">
                    <span className="text-[13px] font-medium text-zinc-500 w-4 text-center shrink-0">--</span>
                    <div className="flex-1 h-[1px] bg-zinc-800/80 relative flex items-center justify-center">
                      <span className="bg-[#0b0c0f] px-3 text-[14px] text-zinc-400 font-normal">
                        Data is currently unavailable.
                      </span>
                    </div>
                  </div>

                  {/* Bottom grid line */}
                  <div className="relative flex items-center gap-3">
                    <span className="text-[13px] font-medium text-zinc-500 w-4 text-center shrink-0">--</span>
                    <div className="flex-1 h-[1px] bg-zinc-800/80"></div>
                  </div>

                  {/* Bottom x-axis dashes */}
                  <div className="flex justify-between pl-7 pr-1 text-[13px] text-zinc-500 font-medium -mt-2">
                    <span>--</span>
                    <span>--</span>
                    <span>--</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audience' && (
            <div className="space-y-6 animate-fadeIn text-left px-1 py-1 pb-20">
              
              {/* 1. WHO VIEWED YOUR REEL */}
              <div 
                className={`space-y-4 pt-2 pb-2 px-1 rounded-2xl border transition-all duration-300 relative select-none cursor-pointer ${
                  isPressingWhoViewed 
                    ? "bg-pink-500/10 border-pink-500/30 scale-[0.98] shadow-inner" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
                onMouseDown={startPressWhoViewed}
                onMouseUp={endPressWhoViewed}
                onMouseLeave={endPressWhoViewed}
                onTouchStart={startPressWhoViewed}
                onTouchEnd={endPressWhoViewed}
                onTouchCancel={endPressWhoViewed}
                onContextMenu={(e) => e.preventDefault()}
                title="Hold for 3s to randomize percentages descendingly"
              >
                {isPressingWhoViewed && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150 z-20">
                    <div className="bg-[#1e1e24] px-4 py-2.5 rounded-full text-[12px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                      Holding 3s to randomize...
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <h4 className="text-[17px] font-bold text-white tracking-tight">
                    Who viewed your reel
                  </h4>
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0 ml-0.5" />
                </div>

                <div className="space-y-3.5">
                  {/* Followers */}
                  <div className="space-y-1.5">
                    <div className="text-[15px] font-normal text-white">Followers</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-[5px] bg-[#222226] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-[#f000b8] rounded-full transition-all duration-500 ${isLoading ? "animate-pulse opacity-40" : ""}`} 
                          style={{ width: `${parseFloat(insights.whoViewedFollowersPercent || "0")}%` }}
                        />
                      </div>
                      <div className="text-[15px] font-semibold text-white min-w-[48px] text-right shrink-0">
                        {isLoading ? (
                          <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                        ) : (
                          <span className="animate-fadeIn">
                            <EditField
                              value={insights.whoViewedFollowersPercent || "0%"}
                              onSave={(val) => handleSaveField("whoViewedFollowersPercent", val)}
                              className="text-[15px] font-semibold text-white"
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Non-followers */}
                  <div className="space-y-1.5">
                    <div className="text-[15px] font-normal text-white">Non-followers</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-[5px] bg-[#222226] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-[#8020e0] rounded-full transition-all duration-500 ${isLoading ? "animate-pulse opacity-40" : ""}`} 
                          style={{ width: `${parseFloat(insights.whoViewedNonFollowersPercent || "100")}%` }}
                        />
                      </div>
                      <div className="text-[15px] font-semibold text-white min-w-[48px] text-right shrink-0">
                        {isLoading ? (
                          <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                        ) : (
                          <span className="animate-fadeIn">
                            <EditField
                              value={insights.whoViewedNonFollowersPercent || "100%"}
                              onSave={(val) => handleSaveField("whoViewedNonFollowersPercent", val)}
                              className="text-[15px] font-semibold text-white"
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. AUDIENCE DETAILS */}
              <div className="space-y-4 pt-3">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[17px] font-bold text-white tracking-tight">
                    Audience details
                  </h4>
                  <Info className="w-4 h-4 text-white stroke-[2] cursor-pointer shrink-0 ml-0.5" />
                </div>

                {/* Filter Chips: Age, Country, Gender */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => setAudienceSubFilter('age')}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition ${
                      audienceSubFilter === 'age'
                        ? 'bg-[#27272a] text-white'
                        : 'border border-zinc-800 text-white hover:bg-zinc-800/40'
                    }`}
                  >
                    Age
                  </button>
                  <button
                    onClick={() => setAudienceSubFilter('country')}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition ${
                      audienceSubFilter === 'country'
                        ? 'bg-[#27272a] text-white'
                        : 'border border-zinc-800 text-white hover:bg-zinc-800/40'
                    }`}
                  >
                    Country
                  </button>
                  <button
                    onClick={() => setAudienceSubFilter('gender')}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition ${
                      audienceSubFilter === 'gender'
                        ? 'bg-[#27272a] text-white'
                        : 'border border-zinc-800 text-white hover:bg-zinc-800/40'
                    }`}
                  >
                    Gender
                  </button>
                </div>

                {/* Age sub-filter content */}
                {audienceSubFilter === 'age' && (
                  <div 
                    className={`space-y-2 pt-2 pb-2 px-1 rounded-2xl border transition-all duration-300 relative select-none cursor-pointer ${
                      isPressingAge 
                        ? "bg-pink-500/10 border-pink-500/30 scale-[0.98] shadow-inner" 
                        : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                    onMouseDown={startPressAge}
                    onMouseUp={endPressAge}
                    onMouseLeave={endPressAge}
                    onTouchStart={startPressAge}
                    onTouchEnd={endPressAge}
                    onTouchCancel={endPressAge}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Hold for 3s to randomize age percentages"
                  >
                    {isPressingAge && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150 z-20">
                        <div className="bg-[#1e1e24] px-4 py-2.5 rounded-full text-[12px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                          Holding 3s to randomize...
                        </div>
                      </div>
                    )}

                    {[
                      { label: "13-17", key: "audienceAge_13_17", defaultVal: "0%" },
                      { label: "18-24", key: "audienceAge_18_24", defaultVal: "9.1%" },
                      { label: "25-34", key: "audienceAge_25_34", defaultVal: "65.4%" },
                      { label: "35-44", key: "audienceAge_35_44", defaultVal: "16.0%" },
                      { label: "45-54", key: "audienceAge_45_54", defaultVal: "7.5%" },
                      { label: "55-64", key: "audienceAge_55_64", defaultVal: "2.0%" },
                      { label: "65+", key: "audienceAge_65_plus", defaultVal: "0.0%" }
                    ].map((item, idx) => {
                      const valStr = (insights as any)[item.key] || item.defaultVal;
                      const pctVal = parseFloat(valStr) || 0;
                      return (
                        <div key={idx} className="space-y-1 text-left">
                          <div className="text-[15px] font-normal text-white">
                            {item.label}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-[5px] bg-[#222226] rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-[#f000b8] rounded-full transition-all duration-500 ${isLoading ? "animate-pulse opacity-40" : ""}`} 
                                style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                              />
                            </div>
                            <div className="text-[15px] font-semibold text-white min-w-[48px] text-right shrink-0">
                              {isLoading ? (
                                <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                              ) : (
                                <span className="animate-fadeIn">
                                  <EditField
                                    value={valStr}
                                    onSave={(val) => handleSaveField(item.key as any, val)}
                                    className="text-[15px] font-semibold text-white"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Country sub-filter content */}
                {audienceSubFilter === 'country' && (
                  <div 
                    className={`space-y-2 pt-2 pb-2 px-1 rounded-2xl border transition-all duration-300 relative select-none cursor-pointer ${
                      isPressingCountry 
                        ? "bg-pink-500/10 border-pink-500/30 scale-[0.98] shadow-inner" 
                        : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                    onMouseDown={startPressCountry}
                    onMouseUp={endPressCountry}
                    onMouseLeave={endPressCountry}
                    onTouchStart={startPressCountry}
                    onTouchEnd={endPressCountry}
                    onTouchCancel={endPressCountry}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Hold for 3s to randomize country percentages descendingly"
                  >
                    {isPressingCountry && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150 z-20">
                        <div className="bg-[#1e1e24] px-4 py-2.5 rounded-full text-[12px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                          Holding 3s to randomize...
                        </div>
                      </div>
                    )}

                    {[
                      { nameKey: "audienceCountry1_name", pctKey: "audienceCountry1_pct", defaultName: "Indonesia", defaultPct: "22.8%" },
                      { nameKey: "audienceCountry2_name", pctKey: "audienceCountry2_pct", defaultName: "Brazil", defaultPct: "17.6%" },
                      { nameKey: "audienceCountry3_name", pctKey: "audienceCountry3_pct", defaultName: "India", defaultPct: "9.4%" },
                      { nameKey: "audienceCountry4_name", pctKey: "audienceCountry4_pct", defaultName: "Philippines", defaultPct: "7.4%" },
                      { nameKey: "audienceCountry5_name", pctKey: "audienceCountry5_pct", defaultName: "Kazakhstan", defaultPct: "4.4%" }
                    ].map((item, idx) => {
                      const nameStr = (insights as any)[item.nameKey] || item.defaultName;
                      const pctStr = (insights as any)[item.pctKey] || item.defaultPct;
                      const pctVal = parseFloat(pctStr) || 0;
                      return (
                        <div key={idx} className="space-y-1 text-left">
                          <div className="text-[15px] font-normal text-white">
                            <EditField
                              value={nameStr}
                              onSave={(val) => handleSaveField(item.nameKey as any, val)}
                              className="text-[15px] font-normal text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-[5px] bg-[#222226] rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-[#f000b8] rounded-full transition-all duration-500 ${isLoading ? "animate-pulse opacity-40" : ""}`} 
                                style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                              />
                            </div>
                            <div className="text-[15px] font-semibold text-white min-w-[48px] text-right shrink-0">
                              {isLoading ? (
                                <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                              ) : (
                                <span className="animate-fadeIn">
                                  <EditField
                                    value={pctStr}
                                    onSave={(val) => handleSaveField(item.pctKey as any, val)}
                                    className="text-[15px] font-semibold text-white"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Gender sub-filter content */}
                {audienceSubFilter === 'gender' && (
                  <div 
                    className={`space-y-2 pt-2 pb-2 px-1 rounded-2xl border transition-all duration-300 relative select-none cursor-pointer ${
                      isPressingGender 
                        ? "bg-pink-500/10 border-pink-500/30 scale-[0.98] shadow-inner" 
                        : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                    onMouseDown={startPressGender}
                    onMouseUp={endPressGender}
                    onMouseLeave={endPressGender}
                    onTouchStart={startPressGender}
                    onTouchEnd={endPressGender}
                    onTouchCancel={endPressGender}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Hold for 3s to randomize gender percentages descendingly"
                  >
                    {isPressingGender && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px] pointer-events-none transition duration-150 z-20">
                        <div className="bg-[#1e1e24] px-4 py-2.5 rounded-full text-[12px] font-bold text-pink-400 border border-pink-500/20 shadow-xl flex items-center gap-2 animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                          Holding 3s to randomize...
                        </div>
                      </div>
                    )}

                    {[
                      { label: "Men", key: "audienceGenderMenPercent", defaultVal: "49.6%", color: "bg-[#f000b8]" },
                      { label: "Women", key: "audienceGenderWomenPercent", defaultVal: "50.4%", color: "bg-[#8020e0]" }
                    ].map((item, idx) => {
                      const valStr = (insights as any)[item.key] || item.defaultVal;
                      const pctVal = parseFloat(valStr) || 0;
                      return (
                        <div key={idx} className="space-y-1 text-left">
                          <div className="text-[15px] font-normal text-white">
                            {item.label}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-[5px] bg-[#222226] rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color} rounded-full transition-all duration-500 ${isLoading ? "animate-pulse opacity-40" : ""}`}
                                style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                              />
                            </div>
                            <div className="text-[15px] font-semibold text-white min-w-[48px] text-right shrink-0">
                              {isLoading ? (
                                <span className="w-10 h-3.5 bg-zinc-800 animate-pulse rounded inline-block" />
                              ) : (
                                <span className="animate-fadeIn">
                                  <EditField
                                    value={valStr}
                                    onSave={(val) => handleSaveField(item.key as any, val)}
                                    className="text-[15px] font-semibold text-white"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
