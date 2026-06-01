import { useState, useMemo } from "react";
import { LeaderboardEntry, UserProfile, Workout } from "../types";
import { Calendar, Crown, Hand, Lock } from "lucide-react";
import { computeCategoryLeaders } from "../gamification";

interface Props {
  userProfile: UserProfile;
  friendsLeaderboard: LeaderboardEntry[];
  globalLeaderboard: LeaderboardEntry[];
  workoutHistory: Workout[];
  leaderboardUnlocked: boolean;
  onChangeLeaderboards: (friends: LeaderboardEntry[], global: LeaderboardEntry[]) => void;
}

type LbTab = "Friends" | "Global" | "Weekly" | "Categories";

export default function LeaderboardView({
  userProfile,
  friendsLeaderboard,
  globalLeaderboard,
  workoutHistory,
  leaderboardUnlocked,
  onChangeLeaderboards
}: Props) {
  const [activeTab, setActiveTab] = useState<LbTab>("Friends");
  const [notification, setNotification] = useState<string | null>(null);

  const weeklyRoster = useMemo(
    () =>
      [...friendsLeaderboard]
        .sort((a, b) => (b.weeklyXp ?? 0) - (a.weeklyXp ?? 0))
        .map((e, i) => ({ ...e, rank: i + 1 })),
    [friendsLeaderboard]
  );

  const categoryLeaders = useMemo(
    () => computeCategoryLeaders(workoutHistory, userProfile.name),
    [workoutHistory, userProfile.name]
  );

  const sendHighFive = (entry: LeaderboardEntry) => {
    setNotification(`High five sent to ${entry.name.split(" ")[0]}!`);
    setTimeout(() => setNotification(null), 3000);
    const updateEntry = (list: LeaderboardEntry[]) =>
      list.map((item) => (item.name === entry.name ? { ...item, highFived: true } : item));
    onChangeLeaderboards(updateEntry(friendsLeaderboard), updateEntry(globalLeaderboard));
  };

  const currentRoster =
    activeTab === "Global"
      ? globalLeaderboard
      : activeTab === "Weekly"
        ? weeklyRoster
        : friendsLeaderboard;

  const xpKey = activeTab === "Weekly" ? "weeklyXp" : "xp";

  const podiumSpots = {
    second: currentRoster.find((item) => item.rank === 2),
    first: currentRoster.find((item) => item.rank === 1),
    third: currentRoster.find((item) => item.rank === 3)
  };

  const remainingList = currentRoster.filter((item) => item.rank > 3);

  if (!leaderboardUnlocked) {
    return (
      <div className="h-full min-h-0 bg-fq-bg flex flex-col items-center justify-center px-8 text-center">
        <Lock className="w-12 h-12 text-white/25 mb-4" />
        <h2 className="text-lg font-medium text-white">Leaderboard locked</h2>
        <p className="text-sm text-white/45 mt-2 leading-relaxed">
          Log your first workout to unlock Friends rankings, weekly sprints, and category leaders.
        </p>
      </div>
    );
  }

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
        <div className="grid grid-cols-2 gap-1.5 bg-white/[0.04] rounded-xl p-[3px] mb-4">
          {(
            [
              ["Friends", "Friends"],
              ["Global", "Global"],
              ["Weekly", "Sprint"],
              ["Categories", "PRs"]
            ] as [LbTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 text-[12px] font-medium rounded-[10px] transition-colors ${
                activeTab === tab ? "bg-[#1d2a22] text-fq-accent" : "text-white/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "Categories" ? (
          <div className="space-y-2">
            <p className="text-xs text-white/45 mb-3">Top volume leaders (squat, bench, deadlift)</p>
            {categoryLeaders.map((c) => (
              <div key={c.exercise} className="fq-card rounded-2xl p-3.5 flex items-center gap-3">
                <div className="fq-avatar">{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{c.exercise}</p>
                  <p className="text-xs text-white/45">
                    {c.name} {c.isMe && <span className="text-fq-accent">· You</span>}
                  </p>
                </div>
                <p className="text-sm font-medium text-fq-accent">{c.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {podiumSpots.first && podiumSpots.second && podiumSpots.third && (
              <div className="grid grid-cols-3 gap-2 items-end mb-4">
                {[podiumSpots.second, podiumSpots.first, podiumSpots.third].map((spot, i) => {
                  const isFirst = i === 1;
                  return (
                    <div
                      key={spot.name}
                      className={`flex flex-col items-center gap-1 ${i === 0 ? "mt-5" : i === 2 ? "mt-7" : ""}`}
                    >
                      {isFirst && (
                        <Crown className="w-[18px] h-[18px] text-fq-amber absolute -translate-y-6" />
                      )}
                      <div
                        className={`rounded-full flex items-center justify-center text-[13px] font-medium ${
                          isFirst
                            ? "w-[54px] h-[54px] bg-[#231e13] border-2 border-fq-amber text-fq-amber"
                            : "w-11 h-11 bg-[#1c2a22] border-2 border-white/20 text-fq-accent"
                        }`}
                      >
                        {spot.avatar}
                      </div>
                      <p className="text-[11px] font-medium text-white truncate w-full text-center">
                        {spot.name.split(" ")[0]}
                      </p>
                      <p className={`text-[11px] ${isFirst ? "text-fq-amber font-medium" : "text-white/45"}`}>
                        {(activeTab === "Weekly" ? spot.weeklyXp ?? 0 : spot.xp).toLocaleString()} XP
                      </p>
                      {spot.topPerformerThisWeek && (
                        <span className="text-[9px] text-fq-amber">Top performer</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-1.5">
              {remainingList.map((entry) => {
                const isUserMe = entry.isMe || entry.name.includes(userProfile.name.split(" ")[0]);
                const displayXp =
                  activeTab === "Weekly" ? entry.weeklyXp ?? 0 : entry[xpKey as "xp"];

                return (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] border ${
                      isUserMe ? "bg-[#141f19] border-fq-accent/25" : "bg-fq-card border-white/[0.06]"
                    }`}
                  >
                    <span className="w-[18px] text-center text-[13px] font-medium text-white/40 shrink-0">
                      {entry.rank}
                    </span>
                    <div
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 ${
                        isUserMe ? "bg-fq-avatar-you text-fq-blue" : "bg-fq-avatar text-fq-accent"
                      }`}
                    >
                      {entry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">
                        {entry.name}
                        {isUserMe && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-fq-accent/12 text-fq-accent">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-white/35">{entry.tier}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-fq-accent">{displayXp.toLocaleString()}</p>
                      {!isUserMe && activeTab !== "Global" && (
                        <button
                          onClick={() => sendHighFive(entry)}
                          disabled={entry.highFived}
                          className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-[10px] text-[11px] border touch-target"
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
          </>
        )}
      </div>
    </div>
  );
}
