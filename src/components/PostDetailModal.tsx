import React, { useState } from "react";
import { Post, Comment, Insights } from "../types";
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, Sparkles, Trash2, Calendar, Eye, Users, Plus, ClipboardCopy, BarChart3, AlertCircle, Play } from "lucide-react";
import InsightsModal from "./InsightsModal";
import ReelInsightsModal from "./ReelInsightsModal";
import { parseCleanInt } from "../utils";

interface PostDetailModalProps {
  post: Post;
  username: string;
  profilePic: string;
  onUpdatePost: (updatedPost: Post) => void;
  onDeletePost: () => void;
  onDuplicatePost: () => void;
  onClose: () => void;
}

export default function PostDetailModal({
  post,
  username,
  profilePic,
  onUpdatePost,
  onDeletePost,
  onDuplicatePost,
  onClose
}: PostDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'comments'>('editor');
  
  // States for live editing
  const [caption, setCaption] = useState(post.caption);
  const [location, setLocation] = useState(post.location);
  const [likes, setLikes] = useState(post.likes);
  const [views, setViews] = useState(post.views);
  const [uploadDate, setUploadDate] = useState(post.uploadDate);
  const [type, setType] = useState(post.type);
  const [mediaUrl, setMediaUrl] = useState(post.insights?.reelMediaUrl || post.mediaUrl);
  
  // Carousel images state
  const [carouselImages, setCarouselImages] = useState<string[]>(post.carouselImages || []);
  const [newCarouselUrl, setNewCarouselUrl] = useState("");

  // Tagged users state
  const [taggedInput, setTaggedInput] = useState(post.taggedUsers.join(", "));

  // Comments state
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newCommentUser, setNewCommentUser] = useState("");
  const [newCommentPic, setNewCommentPic] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentLikes, setNewCommentLikes] = useState(0);

  // Insights state/toggle (Auto-open if video/reel is tapped)
  const [showInsights, setShowInsights] = useState(post.type === "video");

  // Update original post helper
  const triggerUpdate = (updatedFields: Partial<Post>) => {
    onUpdatePost({
      ...post,
      ...updatedFields
    });
  };

  const handleAddField = (key: string, val: any) => {
    if (key === 'caption') {
      setCaption(val);
      triggerUpdate({ caption: val });
    } else if (key === 'location') {
      setLocation(val);
      triggerUpdate({ location: val });
    } else if (key === 'likes') {
      const num = parseCleanInt(val);
      setLikes(num);
      triggerUpdate({ likes: num });
    } else if (key === 'views') {
      const num = parseCleanInt(val);
      setViews(num);
      triggerUpdate({ views: num });
    } else if (key === 'uploadDate') {
      setUploadDate(val);
      triggerUpdate({ uploadDate: val });
    } else if (key === 'mediaUrl') {
      setMediaUrl(val);
      triggerUpdate({ mediaUrl: val });
    } else if (key === 'type') {
      setType(val);
      triggerUpdate({ type: val });
    }
  };

  // Carousel handlers
  const handleAddCarouselImage = () => {
    if (newCarouselUrl.trim()) {
      const updated = [...carouselImages, newCarouselUrl.trim()];
      setCarouselImages(updated);
      setNewCarouselUrl("");
      triggerUpdate({ carouselImages: updated });
    }
  };

  const handleRemoveCarouselImage = (index: number) => {
    const updated = carouselImages.filter((_, i) => i !== index);
    setCarouselImages(updated);
    triggerUpdate({ carouselImages: updated });
  };

  // Tagged users handler
  const handleTaggedBlur = () => {
    const parsed = taggedInput.split(",")
      .map(s => s.trim().replace(/^@/, ""))
      .filter(Boolean);
    triggerUpdate({ taggedUsers: parsed });
  };

  // Comment Handlers
  const handleAddComment = () => {
    if (!newCommentUser.trim() || !newCommentText.trim()) return;
    
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      username: newCommentUser.trim().toLowerCase().replace(/\s+/g, "_"),
      profilePic: newCommentPic.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      text: newCommentText.trim(),
      likes: newCommentLikes,
      timestamp: "1m",
      isLikedByOwner: false
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    triggerUpdate({ comments: updated });

    // Reset fields
    setNewCommentUser("");
    setNewCommentPic("");
    setNewCommentText("");
    setNewCommentLikes(0);
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId);
    setComments(updated);
    triggerUpdate({ comments: updated });
  };

  const handleToggleCommentLikeByOwner = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, isLikedByOwner: !c.isLikedByOwner };
      }
      return c;
    });
    setComments(updated);
    triggerUpdate({ comments: updated });
  };

  const handleUpdateCommentLikes = (commentId: string, value: number) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: value };
      }
      return c;
    });
    setComments(updated);
    triggerUpdate({ comments: updated });
  };

  const handleUpdateInsights = (newInsights: Insights) => {
    const topLevelUpdates: Partial<Post> = { insights: newInsights };
    if (newInsights.likes !== undefined) {
      topLevelUpdates.likes = newInsights.likes;
      setLikes(newInsights.likes);
    }
    if (newInsights.views !== undefined) {
      topLevelUpdates.views = newInsights.views;
      setViews(newInsights.views);
    }
    if (newInsights.shares !== undefined) {
      topLevelUpdates.shares = newInsights.shares;
    }
    if (newInsights.saves !== undefined) {
      topLevelUpdates.saves = newInsights.saves;
    }
    if (newInsights.reelMediaUrl !== undefined) {
      topLevelUpdates.mediaUrl = newInsights.reelMediaUrl;
      setMediaUrl(newInsights.reelMediaUrl);
    }
    triggerUpdate(topLevelUpdates);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-0 sm:p-4 md:p-8 backdrop-blur-sm overflow-y-auto" id="post_detail_backdrop">
      
      {/* Main Container: Left is Instagram View, Right is Smart Editor */}
      <div className="bg-white dark:bg-zinc-950 rounded-none sm:rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] md:max-h-[85vh]">
        
        {/* LEFT PANEL: The Pixel-Perfect Instagram Post Preview */}
        <div className="flex-1 bg-black flex flex-col justify-between h-full min-w-0 md:border-r border-zinc-200 dark:border-zinc-900">
          
          {/* Post Header */}
          <div className="bg-white dark:bg-zinc-900 p-3 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-zinc-200" referrerPolicy="no-referrer" />
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">@{username}</span>
                  <span className="w-3 h-3 bg-sky-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">✓</span>
                </div>
                {location && (
                  <p className="text-[10px] text-zinc-500 truncate flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {location}
                  </p>
                )}
              </div>
            </div>
            <button className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Media Viewport */}
          <div className="flex-1 bg-zinc-900 flex items-center justify-center relative group min-h-[250px] md:min-h-0 overflow-hidden">
            <img src={mediaUrl} alt="Post Content" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            
            {/* Tagged users tags list */}
            {post.taggedUsers.length > 0 && (
              <div className="absolute bottom-3 left-3 bg-black/75 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1.5 font-semibold">
                <Users className="w-3 h-3 text-sky-400" />
                <span>Tagged: {post.taggedUsers.map(u => `@${u}`).join(", ")}</span>
              </div>
            )}

            {/* Video overlay icon if video */}
            {type === "video" && (
              <div className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full text-white">
                <Play className="w-4 h-4 fill-white" />
              </div>
            )}

            {/* Carousel indicator */}
            {type === "carousel" && carouselImages.length > 0 && (
              <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                1/{carouselImages.length}
              </div>
            )}
          </div>

          {/* Action Row & Interactive Comments (Instagram style) */}
          <div className="bg-white dark:bg-zinc-900 p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            
            {/* Icons row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 text-zinc-800 dark:text-zinc-200">
                <Heart className="w-6 h-6 hover:text-red-500 hover:scale-115 transition cursor-pointer" />
                <MessageCircle className="w-6 h-6 hover:scale-115 transition cursor-pointer" />
                <Send className="w-6 h-6 hover:scale-115 transition cursor-pointer" />
              </div>
              <Bookmark className="w-6 h-6 text-zinc-800 dark:text-zinc-200 hover:scale-115 transition cursor-pointer" />
            </div>

            {/* Likes count & views */}
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between select-none">
              <span 
                onClick={() => setShowInsights(true)} 
                className="cursor-pointer hover:text-sky-500 transition duration-150 hover:underline"
                title="Tap to edit likes/insights metrics"
              >
                {likes.toLocaleString()} likes
              </span>
              {type === "video" && views > 0 && (
                <span 
                  onClick={() => setShowInsights(true)} 
                  className="text-zinc-500 font-medium cursor-pointer hover:text-sky-500 transition duration-150 hover:underline"
                  title="Tap to edit views/insights metrics"
                >
                  {views.toLocaleString()} plays
                </span>
              )}
            </div>

            {/* Caption & Comments List - Scrollable */}
            <div className="max-h-[160px] md:max-h-[220px] overflow-y-auto scrollbar-none space-y-2.5 text-xs pr-1 border-t border-zinc-100 dark:border-zinc-800/50 pt-2 text-left">
              
              {/* Caption */}
              {caption && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">@{username}</span>
                  <p className="text-zinc-800 dark:text-zinc-300 whitespace-pre-line leading-normal">{caption}</p>
                </div>
              )}

              {/* Comments */}
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 group/comment relative">
                  <img src={comment.profilePic} alt={comment.username} className="w-5.5 h-5.5 rounded-full object-cover border border-zinc-100" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-800 dark:text-zinc-300 leading-normal">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-1">@{comment.username}</span>
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                      <span>{comment.timestamp}</span>
                      {comment.likes > 0 && <span>{comment.likes} likes</span>}
                      {comment.isLikedByOwner && (
                        <span className="text-rose-500 flex items-center gap-0.5">
                          ❤️ Liked by creator
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Date footer */}
            <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider pt-1 flex justify-between items-center">
              <span>{uploadDate || "Just now"}</span>
              <button
                onClick={() => setShowInsights(true)}
                className="flex items-center gap-1 text-sky-500 hover:text-sky-600 font-bold transition capitalize"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                View Insights
              </button>
            </div>

          </div>
        </div>


        {/* RIGHT PANEL: Live Editor Suite */}
        <div className="w-full md:w-[380px] bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full">
          
          {/* Editor Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100 dark:bg-zinc-900/60">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Smart Post Editor</span>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Editor Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition ${
                activeTab === 'editor' 
                  ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Configure Post
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition ${
                activeTab === 'comments' 
                  ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4">
            {activeTab === 'editor' ? (
              <div className="space-y-4 text-left">
                
                {/* Media URL Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Post Media URL</label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => handleAddField("mediaUrl", e.target.value)}
                    placeholder="Unsplash image or Base64 URL"
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>Supports files or public Unsplash links.</span>
                  </div>
                </div>

                {/* Post Type Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Post Type</label>
                  <select
                    value={type}
                    onChange={(e) => handleAddField("type", e.target.value)}
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="image">Standard Image</option>
                    <option value="video">Reel / Video</option>
                    <option value="carousel">Carousel (Swipe)</option>
                  </select>
                </div>

                {/* Carousel Multi-images input (Only if carousel) */}
                {type === "carousel" && (
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl space-y-2.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Carousel Images</span>
                    <div className="space-y-1.5">
                      {carouselImages.map((img, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-xs text-zinc-400 w-4 font-mono">{i+1}.</span>
                          <input
                            type="text"
                            value={img}
                            readOnly
                            className="flex-1 text-[10px] bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-zinc-500 truncate"
                          />
                          <button onClick={() => handleRemoveCarouselImage(i)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Add slide image URL"
                        value={newCarouselUrl}
                        onChange={(e) => setNewCarouselUrl(e.target.value)}
                        className="flex-1 text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        onClick={handleAddCarouselImage}
                        className="px-2 py-1 bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] font-bold rounded hover:opacity-90"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Location Tag</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleAddField("location", e.target.value)}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Textarea Caption */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Post Caption</label>
                  <textarea
                    rows={4}
                    value={caption}
                    onChange={(e) => handleAddField("caption", e.target.value)}
                    placeholder="Write a captivating description..."
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100 resize-none font-sans"
                  />
                </div>

                {/* Tagged users list string */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tag Users (Comma Separated)</label>
                  <input
                    type="text"
                    value={taggedInput}
                    onChange={(e) => setTaggedInput(e.target.value)}
                    onBlur={handleTaggedBlur}
                    placeholder="e.g., travel_guide, explore"
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Likes count & plays */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Likes Count</label>
                    <input
                      type="text"
                      value={likes}
                      onChange={(e) => handleAddField("likes", e.target.value)}
                      className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  {type === "video" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Video Plays</label>
                      <input
                        type="text"
                        value={views}
                        onChange={(e) => handleAddField("views", e.target.value)}
                        className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  )}
                </div>

                {/* Upload Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Upload Date string</label>
                  <input
                    type="text"
                    value={uploadDate}
                    onChange={(e) => handleAddField("uploadDate", e.target.value)}
                    placeholder="e.g., 3 days ago, October 12"
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Quick actions for post */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <button
                    onClick={onDuplicatePost}
                    className="w-full py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
                  >
                    Duplicate Post
                  </button>
                  <button
                    onClick={onDeletePost}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition"
                  >
                    Delete Post
                  </button>
                </div>

              </div>
            ) : (
              // COMMENTS SUB-PANEL
              <div className="space-y-4 text-left">
                
                {/* Add Comment Section */}
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Add Simulated Comment</span>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Username (e.g. food_critic)"
                      value={newCommentUser}
                      onChange={(e) => setNewCommentUser(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100"
                    />
                    
                    <input
                      type="text"
                      placeholder="Profile Pic URL (Optional)"
                      value={newCommentPic}
                      onChange={(e) => setNewCommentPic(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100"
                    />

                    <textarea
                      rows={2}
                      placeholder="Comment text..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100 resize-none"
                    />
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Heart className="w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Likes"
                          value={newCommentLikes || ""}
                          onChange={(e) => setNewCommentLikes(parseCleanInt(e.target.value))}
                          className="w-14 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-zinc-900 dark:text-zinc-100 text-center"
                        />
                      </div>
                      <button
                        onClick={handleAddComment}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Post Comment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Manager List */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Manage Comments</span>
                  {comments.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No comments found. Create one above!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-3 bg-white dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">@{c.username}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCommentLikeByOwner(c.id)}
                              className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700/50 ${c.isLikedByOwner ? "text-rose-500" : "text-zinc-400"}`}
                              title="Pin Heart (Liked by Creator)"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded">{c.text}</p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Comment Likes:</span>
                          <input
                            type="text"
                            value={c.likes}
                            onChange={(e) => handleUpdateCommentLikes(c.id, parseCleanInt(e.target.value))}
                            className="w-14 text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1 text-center text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-95 transition"
            >
              Done Editing
            </button>
          </div>

        </div>

      </div>

      {/* Insights Dashboard Modal popup */}
      {showInsights && (
        post.type === "video" ? (
          <ReelInsightsModal
            post={post}
            username={username}
            onUpdateInsights={handleUpdateInsights}
            onClose={() => setShowInsights(false)}
          />
        ) : (
          <InsightsModal
            post={post}
            username={username}
            onUpdateInsights={handleUpdateInsights}
            onClose={() => setShowInsights(false)}
          />
        )
      )}

    </div>
  );
}
