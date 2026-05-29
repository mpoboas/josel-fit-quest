import { useState } from "react";
import { LeaderboardEntry, UserProfile } from "../types";
import { Trophy, Send, Users, Globe, Calendar, Zap, Sparkles } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  friendsLeaderboard: LeaderboardEntry[];
  globalLeaderboard: LeaderboardEntry[];
  onChangeLeaderboards: (friends: LeaderboardEntry[], global: LeaderboardEntry[]) => void;
}

export default function LeaderboardView({ userProfile, friendsLeaderboard, globalLeaderboard, onChangeLeaderboards }: Props) {
  const [activeTab, setActiveTab] = useState<"Friends" | "Global" | "Weekly" | "Category">("Friends");
  const [notification, setNotification] = useState<string | null>(null);

  // Send High Five handler
  const sendHighFive = (entry: LeaderboardEntry) => {
    // Notify user
    setNotification(`👋 High Five sent to ${entry.name}! Plus motivators shared.`);
    setTimeout(() => setNotification(null), 3000);

    // Update state to flag high-fived entry
    const updateEntry = (list: LeaderboardEntry[]) =>
      list.map((item) => (item.name === entry.name ? { ...item, highFived: true } : item));

    onChangeLeaderboards(updateEntry(friendsLeaderboard), updateEntry(globalLeaderboard));
  };

  // Get current active roster
  const currentRoster = activeTab === "Friends" || activeTab === "Weekly" ? friendsLeaderboard : globalLeaderboard;

  // Render podium spots (1st, 2nd, 3rd) dynamically from roster
  const podiumSpots = {
    // 2nd
    second: currentRoster.find(item => item.rank === 2) || { rank: 2, name: "João R.", avatar: "JR", xp: 4200, tier: "Silver" as const },
    // 1st
    first: currentRoster.find(item => item.rank === 1) || { rank: 1, name: "Ana S.", avatar: "AS", xp: 6100, tier: "Gold" as const },
    // 3rd
    third: currentRoster.find(item => item.rank === 3) || { rank: 3, name: "Tiago F.", avatar: "TF", xp: 3850, tier: "Silver" as const }
  };

  // Remaining list below podium
  const remainingList = currentRoster.filter(item => item.rank > 3);

  return (
    <div id="leaderboard-view" className="h-full bg-[#050505] text-slate-100 flex flex-col overflow-y-auto">
      
      {/* Dynamic High Five Toast bubble */}
      {notification && (
        <div id="lb-toast" className="fixed top-4 left-4 right-4 bg-zinc-900 border border-cyan-500/30 text-cyan-100 px-4 py-3 rounded-xl shadow-2xl z-50 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase font-mono shrink-0">SOCIALISER BONUS</span>
        </div>
      )}

      {/* Ranks Tabs Header Selector */}
      <div className="bg-zinc-900/50 border-b border-white/5 shrink-0">
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
          <span className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 flex items-center gap-1.5 font-serif italic">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span className="text-white">Leaderboards</span>
          </span>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
            <Calendar className="w-4 h-4" />
            <span>Resets Mon 00:00</span>
          </div>
        </div>
        
        <div className="flex font-mono text-xs">
          {(["Friends", "Global", "Weekly", "Category"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-3 font-semibold transition-all relative ${
                activeTab === tab ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Block Elements */}
      <div className="bg-gradient-to-b from-zinc-900/40 to-[#050505] p-4 pt-6 pb-2 shrink-0 border-b border-white/5">
        <div id="lb-podium" className="flex items-end justify-center gap-3 max-w-sm mx-auto">
          
          {/* 2nd Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full border-2 border-slate-500 bg-zinc-900 flex items-center justify-center font-bold font-mono text-xs text-white shadow-lg relative">
              {podiumSpots.second.avatar}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center text-[10px] font-black border border-[#050505]">
                2
              </span>
            </div>
            <span className="text-xs font-bold text-slate-300 mt-2 truncate w-20 text-center">{podiumSpots.second.name}</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{(podiumSpots.second.xp).toLocaleString()} XP</span>
            
            {/* 2nd Plinth */}
            <div className="w-14 bg-zinc-900/80 border-t border-white/10 rounded-t-xl h-12 mt-3 flex items-center justify-center">
              <span className="text-sm font-black text-slate-500 font-serif italic">II</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center flex-1 -translate-y-2">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-400 bg-zinc-950 flex items-center justify-center font-bold font-mono text-sm text-white shadow-2xl relative animate-pulse">
              {podiumSpots.first.avatar}
              <span className="absolute -top-2.5 right-1/2 translate-x-1/2 text-lg">👑</span>
            </div>
            <span className="text-sm font-extrabold text-cyan-400 mt-2 truncate w-24 text-center font-serif italic">{podiumSpots.first.name}</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">{(podiumSpots.first.xp).toLocaleString()} XP</span>
            
            {/* 1st Plinth */}
            <div className="w-16 bg-zinc-900 border-t-2 border-cyan-400/30 rounded-t-xl h-16 mt-3 flex items-center justify-center">
              <span className="text-base font-black text-cyan-400 font-serif italic">I</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center font-bold font-mono text-xs text-white shadow-lg relative">
              {podiumSpots.third.avatar}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center text-[10px] font-black border border-[#050505]">
                3
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400 mt-2 truncate w-20 text-center">{podiumSpots.third.name}</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{(podiumSpots.third.xp).toLocaleString()} XP</span>
            
            {/* 3rd Plinth */}
            <div className="w-14 bg-zinc-900/60 border-t border-white/10 rounded-t-xl h-8 mt-3 flex items-center justify-center">
              <span className="text-xs font-black text-slate-600 font-serif italic">III</span>
            </div>
          </div>

        </div>
      </div>

      {/* Leaderboard Table List Scroll area */}
      <div className="flex-1 px-4 pb-10">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 mt-4">Competing Athletes</h3>
        
        <div id="lb-table-list" className="space-y-2">
          {remainingList.map((entry) => {
            const isUserMe = entry.isMe || entry.name.includes(userProfile.name.split(" ")[0]);
            
            return (
              <div 
                key={entry.rank + entry.name}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isUserMe 
                    ? "bg-cyan-500/10 border-cyan-500/35 shadow-[0_4px_12px_rgba(34,211,238,0.05)]" 
                    : "bg-zinc-900/50 border-white/5"
                }`}
              >
                {/* Ranking Index */}
                <span className={`w-6 text-center font-mono text-xs font-bold shrink-0 ${
                  isUserMe ? "text-cyan-400" : "text-slate-500"
                }`}>
                  {entry.rank}
                </span>

                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                  isUserMe 
                    ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30" 
                    : "bg-zinc-850 text-slate-300 border border-white/5"
                }`}>
                  {entry.avatar}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 font-serif italic">
                    <span>{entry.name}</span>
                    {isUserMe && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/15 text-cyan-400 font-mono font-bold uppercase shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">{entry.tier || "Bronze"} Athlete</span>
                </div>

                {/* Points Count */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-cyan-400 font-mono">{(entry.xp).toLocaleString()} XP</div>
                  
                  {/* High Five option for anyone except Me */}
                  {!isUserMe && entry.rank <= 7 && (
                    <button 
                      onClick={() => sendHighFive(entry)}
                      disabled={entry.highFived}
                      className={`mt-1 inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-mono tracking-widest font-semibold uppercase active:scale-95 transition-all ${
                        entry.highFived 
                          ? "bg-white/5 text-slate-500 cursor-not-allowed" 
                          : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      <span>👋</span>
                      <span>{entry.highFived ? "Shared" : "High Five"}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
