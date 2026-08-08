import { InstagramProfile } from "./types";

export const defaultProfile: InstagramProfile = {
  id: "default_wanderlust",
  projectName: "Default - @wanderlust_clara",
  username: "wanderlust_clara",
  displayName: "Clara Vance | Travel & Adventure",
  profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
  bio: "📍 Exploring the unseen corners of the world\n✈️ Next stop: Kyoto, Japan\n💌 Collabs: contact@claraexplore.com\n👇 Grab my travel guides!",
  website: "linktr.ee/claraexplore",
  category: "Digital Creator",
  isVerified: true,
  isPrivate: false,
  followersCount: 142500,
  followingCount: 482,
  highlights: [
    {
      id: "hl_1",
      title: "Kyoto '26",
      cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop&q=80"
    },
    {
      id: "hl_2",
      title: "Amalfi 🍋",
      cover: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=200&h=200&fit=crop&q=80"
    },
    {
      id: "hl_3",
      title: "Stay Cozy",
      cover: "https://images.unsplash.com/photo-1510379872535-71102c09896c?w=200&h=200&fit=crop&q=80"
    },
    {
      id: "hl_4",
      title: "Travel Tips",
      cover: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop&q=80"
    }
  ],
  posts: [
    {
      id: "post_1",
      type: "video",
      mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop&q=80",
      caption: "Golden hour in Bali hits differently. 🌅 There is something magical about the ocean breeze and the endless horizon. Writing down my top 5 secret sunset spots in Bali for my next newsletter, link in bio! ✨\n\n#bali #sunset #goldenhour #travelblogger #indonesia #wanderlust",
      likes: 12402,
      shares: 3420,
      saves: 5210,
      views: 94250,
      uploadDate: "3 days ago",
      location: "Uluwatu, Bali, Indonesia",
      taggedUsers: ["balitravelguide", "exploreindonesia"],
      comments: [
        {
          id: "c_1",
          username: "kai_adventures",
          profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
          text: "This shot is unreal! Is this near Uluwatu temple? 😍",
          likes: 42,
          timestamp: "3d",
          isLikedByOwner: true
        },
        {
          id: "c_2",
          username: "nomad_grace",
          profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
          text: "Adding Uluwatu to my bucket list immediately! Gorgeous sunset Clara",
          likes: 18,
          timestamp: "2d"
        },
        {
          id: "c_3",
          username: "travel_lens",
          profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80",
          text: "Stunning colors! What camera setup did you use for this video?",
          likes: 5,
          timestamp: "1d"
        }
      ],
      insights: {
        reach: 84200,
        impressions: 110400,
        accountsEngaged: 14210,
        profileVisits: 1840,
        follows: 342,
        websiteTaps: 412,
        shares: 3420,
        saves: 5210,
        watchTime: "112h 45m",
        avgWatchTime: "0:14"
      }
    },
    {
      id: "post_2",
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&fit=crop&q=80",
      caption: "Croissant, café au lait, and Parisian views. The perfect morning recipe. ☕️🥐 Spent the entire morning getting lost in the streets of Montmartre. Paris has my heart forever.\n\n#paris #montmartre #france #coffee #parisianstyle #coffeeshop",
      likes: 8940,
      shares: 1120,
      saves: 2840,
      views: 0,
      uploadDate: "5 days ago",
      location: "Montmartre, Paris, France",
      taggedUsers: [],
      comments: [
        {
          id: "c_4",
          username: "sophia_foodie",
          profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
          text: "Ah, the croissants in Montmartre are unparalleled! Try 'Coquelicot' next time!",
          likes: 23,
          timestamp: "5d",
          isLikedByOwner: true
        },
        {
          id: "c_5",
          username: "pierre_travels",
          profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80",
          text: "Welcome to my city! Enjoy the autumn breeze 🍂",
          likes: 12,
          timestamp: "4d"
        }
      ],
      insights: {
        reach: 45200,
        impressions: 59300,
        accountsEngaged: 9480,
        profileVisits: 890,
        follows: 114,
        websiteTaps: 184,
        shares: 1120,
        saves: 2840,
        watchTime: "0s",
        avgWatchTime: "0s"
      }
    },
    {
      id: "post_3",
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1510379872535-71102c09896c?w=800&fit=crop&q=80",
      caption: "Cabin fever, but make it Norwegian. 🪵❄️ Waking up to a frozen lake and a steaming cup of tea is the definition of hygge. Would you stay here?",
      likes: 11240,
      shares: 2450,
      saves: 4320,
      views: 0,
      uploadDate: "1 week ago",
      location: "Lofoten, Norway",
      taggedUsers: ["visitnorway"],
      comments: [
        {
          id: "c_6",
          username: "nordic_spirit",
          profilePic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&q=80",
          text: "True Norwegian hygge! Best way to survive winter ☕❄️",
          likes: 31,
          timestamp: "1w",
          isLikedByOwner: true
        }
      ],
      insights: {
        reach: 68100,
        impressions: 89000,
        accountsEngaged: 12380,
        profileVisits: 1410,
        follows: 210,
        websiteTaps: 295,
        shares: 2450,
        saves: 4320,
        watchTime: "0s",
        avgWatchTime: "0s"
      }
    },
    {
      id: "post_4",
      type: "carousel",
      mediaUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&q=80",
      carouselImages: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop&q=80"
      ],
      caption: "Hiking through the majestic Swiss Alps (swipe for some breathtaking panoramic views!). 🏔️🎒 Scaling these heights is tough but the rewarding views make every single step worth it.\n\nWhich view is your favorite? 1, 2, or 3?",
      likes: 14890,
      shares: 1980,
      saves: 6120,
      views: 0,
      uploadDate: "2 weeks ago",
      location: "Zermatt, Switzerland",
      taggedUsers: ["visitswitzerland"],
      comments: [
        {
          id: "c_7",
          username: "mountain_man",
          profilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
          text: "View 3 with the lake reflection is breathtaking Clara!",
          likes: 54,
          timestamp: "2w",
          isLikedByOwner: false
        }
      ],
      insights: {
        reach: 79200,
        impressions: 118300,
        accountsEngaged: 17290,
        profileVisits: 2040,
        follows: 450,
        websiteTaps: 320,
        shares: 1980,
        saves: 6120,
        watchTime: "0s",
        avgWatchTime: "0s"
      }
    },
    {
      id: "post_5",
      type: "video",
      mediaUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&fit=crop&q=80",
      caption: "Midnight ramen run in Tokyo. 🍜🇯🇵 Nothing beats the atmosphere of a tiny 8-seat ramen stall in Shinjuku. The rich tonkotsu broth is out of this world! Pinning this exact spot for my Tokyo itinerary guide.",
      likes: 16540,
      shares: 4890,
      saves: 7230,
      views: 124900,
      uploadDate: "3 weeks ago",
      location: "Shinjuku, Tokyo, Japan",
      taggedUsers: [],
      comments: [
        {
          id: "c_8",
          username: "tokyo_bites",
          profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
          text: "Shinjuku alleys are the absolute best for ramen! Is this near Omoide Yokocho? 🤤",
          likes: 88,
          timestamp: "3w",
          isLikedByOwner: true
        }
      ],
      insights: {
        reach: 114200,
        impressions: 156000,
        accountsEngaged: 19840,
        profileVisits: 3120,
        follows: 620,
        websiteTaps: 840,
        shares: 4890,
        saves: 7230,
        watchTime: "185h 12m",
        avgWatchTime: "0:11"
      }
    },
    {
      id: "post_6",
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&fit=crop&q=80",
      caption: "Standing in awe of history at the Giza Pyramids. 🇪🇬🐪 Seeing these ancient wonders in person is a humbling experience. Truly a timeless marvel.",
      likes: 9230,
      shares: 890,
      saves: 1540,
      views: 0,
      uploadDate: "1 month ago",
      location: "Pyramids of Giza, Cairo, Egypt",
      taggedUsers: [],
      comments: [
        {
          id: "c_9",
          username: "history_buff",
          profilePic: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&q=80",
          text: "Outstanding photo. It is hard to comprehend their scale until you stand right there.",
          likes: 19,
          timestamp: "4w"
        }
      ],
      insights: {
        reach: 41200,
        impressions: 52000,
        accountsEngaged: 8120,
        profileVisits: 750,
        follows: 92,
        websiteTaps: 110,
        shares: 890,
        saves: 1540,
        watchTime: "0s",
        avgWatchTime: "0s"
      }
    }
  ],
  taggedPosts: [
    {
      id: "t_post_1",
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&fit=crop&q=80",
      caption: "Had the absolute best time exploring the Amalfi coast with the incredible @wanderlust_clara! 🍋🎒 Thanks for showing us the best hidden beaches and gelato spots! Check out her profile for the full guide.",
      likes: 3102,
      shares: 215,
      saves: 480,
      views: 0,
      uploadDate: "June 14, 2026",
      location: "Positano, Amalfi Coast, Italy",
      taggedUsers: ["wanderlust_clara"],
      comments: [
        {
          id: "tc_1",
          username: "wanderlust_clara",
          profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
          text: "Such a fun day! We need to go back for that pistachio gelato ASAP! 🍦❤️",
          likes: 45,
          timestamp: "4w",
          isLikedByOwner: true
        }
      ],
      insights: {
        reach: 12000,
        impressions: 15400,
        accountsEngaged: 3500,
        profileVisits: 220,
        follows: 15,
        websiteTaps: 8,
        shares: 215,
        saves: 480,
        watchTime: "0s",
        avgWatchTime: "0s"
      }
    }
  ],
  activeTab: "posts"
};
