import { useState } from "react";
import { LeaderboardEntry, UserProfile } from "../types";
import { Calendar, Crown, Hand } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  friendsLeaderboard: LeaderboardEntry[];
  globalLeaderboard: LeaderboardEntry[];
  onChangeLeaderboards: (friends: LeaderboardEntry[], global: LeaderboardEntry[]) => void;
}

export default function LeaderboardView({
  userProfile,
  friendsLeaderboard,
  globalLeaderboard,
  onChangeLeaderboards
}: Props) {
  const [activeTab, setActiveTab] = useState<"Friends" | "Global">("Friends");
  const [notification, setNotification] = useState<string | null>(null);

  const sendHighFive = (entry: LeaderboardEntry) => {
    setNotification(`High five sent to ${entry.name.split(" ")[0]}!`);
    setTimeout(() => setNotification(null), 3000);

    const updateEntry = (list: LeaderboardEntry[]) =>
      list.map((item) => (item.name === entry.name ? { ...item, highFived: true } : item));

    onChangeLeaderboards(updateEntry(friendsLeaderboard), updateEntry(globalLeaderboard));
  };

  const currentRoster = activeTab === "Friends" ? friendsLeaderboard : globalLeaderboard;

  const podiumSpots = {
    second: currentRoster.find((item) => item.rank === 2) ?? {
      rank: 2,
      name: "João R.",
      avatar: "JR",
      xp: 4200,
      tier: "Silver" as const
    },
    first: currentRoster.find((item) => item.rank === 1) ?? {
      rank: 1,
      name: "Ana S.",
      avatar: "AS",
      xp: 6100,
      tier: "Gold" as const
    },
    third: currentRoster.find((item) => item.rank === 3) ?? {
      rank: 3,
      name: "Tiago F.",
      avatar: "TF",
      xp: 3850,
      tier: "Silver" as const
    }
  };

  const remainingList = currentRoster.filter((item) => item.rank > 3);

  return (
    <div className="h-full min-h-0 bg-fq-bg text-[#f0f0f0] flex flex-col overflow-y-auto scroll-container">
      {notification && (
        <div className="fixed top-0 left-0 right-0 z-50 fq-top safe-x px-4 pb-1">
          <div className="fq-card px-4 py-3 text-sm text-fq-accent border-fq-accent/25">{notification}</div>
        </div>
      )}

      <header className="flex items-center justify-between px-4 fq-top pb-3 shrink-0">
        <h1 className="text-[17px] font-medium text-white">Leaderboard</h1>
        <span className="text-xs text-white/35 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Resets Mon
        </span>
      </header>

      <div className="px-4 pb-6">
        {/* Tabs */}
        <div className="flex bg-white/[0.04] rounded-xl p-[3px] mb-4">
          {(["Friends", "Global"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[13px] font-medium rounded-[10px] transition-colors ${
                activeTab === tab ? "bg-[#1d2a22] text-fq-accent" : "text-white/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-2 items-end mb-4">
          <div className="flex flex-col items-center gap-1 mt-5">
            <div className="w-11 h-11 rounded-full bg-[#1c2a22] border-2 border-white/20 flex items-center justify-center text-[13px] font-medium text-fq-accent">
              {podiumSpots.second.avatar}
            </div>
            <p className="text-[11px] font-medium text-white text-center truncate w-full">
              {podiumSpots.second.name.split(" ")[0]}
            </p>
            <p className="text-[11px] text-white/45">{podiumSpots.second.xp.toLocaleString()} XP</p>
            <div className="w-full h-11 mt-1.5 rounded-t-md bg-white/[0.07]" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Crown className="w-[18px] h-[18px] text-fq-amber absolute -top-3.5 left-1/2 -translate-x-1/2" />
              <div className="w-[54px] h-[54px] rounded-full bg-[#231e13] border-2 border-fq-amber flex items-center justify-center text-[15px] font-medium text-fq-amber">
                {podiumSpots.first.avatar}
              </div>
            </div>
            <p className="text-[11px] font-medium text-white text-center truncate w-full">
              {podiumSpots.first.name.split(" ")[0]}
            </p>
            <p className="text-[11px] text-fq-amber font-medium">
              {podiumSpots.first.xp.toLocaleString()} XP
            </p>
            <div className="w-full h-16 mt-1.5 rounded-t-md bg-fq-amber/[0.13]" />
          </div>

          <div className="flex flex-col items-center gap-1 mt-7">
            <div className="w-11 h-11 rounded-full bg-[#1c2a22] border-2 border-fq-accent/25 flex items-center justify-center text-[13px] font-medium text-fq-accent">
              {podiumSpots.third.avatar}
            </div>
            <p className="text-[11px] font-medium text-white text-center truncate w-full">
              {podiumSpots.third.name.split(" ")[0]}
            </p>
            <p className="text-[11px] text-white/45">{podiumSpots.third.xp.toLocaleString()} XP</p>
            <div className="w-full h-9 mt-1.5 rounded-t-md bg-fq-amber/[0.08]" />
          </div>
        </div>

        {/* List */}
        <div className="space-y-1.5">
          {remainingList.map((entry) => {
            const isUserMe = entry.isMe || entry.name.includes(userProfile.name.split(" ")[0]);

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] border ${
                  isUserMe
                    ? "bg-[#141f19] border-fq-accent/25"
                    : "bg-fq-card border-white/[0.06]"
                }`}
              >
                <span className="w-[18px] text-center text-[13px] font-medium text-white/40 shrink-0">
                  {entry.rank}
                </span>

                <div
                  className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 ${
                    isUserMe
                      ? "bg-fq-avatar-you text-fq-blue"
                      : "bg-fq-avatar text-fq-accent"
                  }`}
                >
                  {entry.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">
                    {entry.name}
                    {isUserMe && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-fq-accent/12 text-fq-accent font-medium">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-white/35">{entry.tier || "Bronze"}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm font-medium ${isUserMe ? "text-fq-accent" : "text-fq-accent"}`}>
                    {entry.xp.toLocaleString()}
                  </p>
                  {!isUserMe && entry.rank <= 10 && (
                    <button
                      onClick={() => sendHighFive(entry)}
                      disabled={entry.highFived}
                      className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-[10px] text-[11px] border touch-target active:scale-95 transition-all ${
                        entry.highFived
                          ? "bg-white/5 border-white/[0.09] text-white/35"
                          : "bg-white/[0.05] border-white/[0.09] text-white/45"
                      }`}
                    >
                      <Hand className="w-3 h-3" />
                      {entry.highFived ? "Sent" : "High five"}
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
