import React, { useState } from 'react';
import { 
  Grid, 
  Bookmark, 
  UserSquare2, 
  Settings, 
  Camera, 
  Plus, 
  Image as ImageIcon 
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate?: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'artworks' | 'saved' | 'tagged'>('posts');

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-white font-sans pb-16 overflow-hidden">
      
      {/* 1. Profile Header Section */}
      <div className="px-6 py-10 md:px-12 md:py-12 border-b border-white/5 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
        
        {/* Profile Picture Placeholder */}
        <div className="relative flex-shrink-0 select-none">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/40 shadow-inner relative group cursor-pointer hover:bg-white/[0.05] transition-colors">
            <Camera className="w-8 h-8 md:w-12 md:h-12 stroke-[1.2]" />
            <div className="absolute bottom-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#0095F6] hover:bg-[#1877F2] text-white flex items-center justify-center shadow transition-colors border border-black">
              <Plus className="w-3.5 h-3.5 md:w-5 md:h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 flex flex-col gap-4 text-center md:text-left w-full">
          
          {/* Row 1: Name and Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <h2 className="text-xl font-light tracking-wide text-white">YOUR NAME</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => alert("Edit Profile screen is disabled in preview")}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition-colors text-white"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '?profile=yourname');
                  alert("Profile link copied to clipboard!");
                }}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition-colors text-white"
              >
                Share Profile
              </button>
              <button 
                onClick={() => alert("Settings panel is disabled in preview")}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white cursor-pointer"
                title="Options"
              >
                <Settings className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Row 2: Statistics */}
          <div className="flex justify-center md:justify-start gap-8 md:gap-10 border-y sm:border-y-0 border-white/5 py-3 sm:py-0 text-sm select-none">
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">posts</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">followers</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">following</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">artworks</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">likes</span>
            </div>
          </div>

          {/* Row 3: Username */}
          <div className="text-sm">
            <span className="font-semibold text-white/40">@yourname</span>
          </div>

        </div>
      </div>

      {/* 2. Instagram Tab Controls */}
      <div className="flex justify-center border-b border-white/5 text-xs font-semibold select-none text-white/40 gap-12">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'posts' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('artworks')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'artworks' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Artworks</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'saved' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Saved</span>
        </button>

        <button
          onClick={() => setActiveTab('tagged')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'tagged' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <UserSquare2 className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Tagged</span>
        </button>
      </div>

      {/* 3. Empty Artwork Area (Same for all tabs) */}
      <div className="py-24 px-6 text-center select-none">
        <div className="w-16 h-16 rounded-full border border-white/20 border-dashed flex items-center justify-center mx-auto mb-4 text-white/60">
          <ImageIcon className="w-7 h-7 stroke-[1.2]" />
        </div>
        <h3 className="text-xl font-light text-white/90 mb-1">No posts yet</h3>
        <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
          Your uploaded artworks will appear here.
        </p>
        <button 
          onClick={() => alert("Upload feature is disabled in preview mode")}
          className="px-5 py-2.5 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
        >
          Upload Your First Artwork
        </button>
      </div>

    </div>
  );
};
