import { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Edit3,
  Copy,
  CheckCircle,
  Activity,
  Award,
  Calendar,
  Clock,
  Trophy,
  Gift,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/user";
import { useWallets } from "@privy-io/react-auth";
import EditProfileModal from "./EditProfile";

const UserProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData] = useAtom(userAtom);
  const { wallets } = useWallets();

  const transactions = [
    {
      id: "1",
      date: "2024-01-1",
      amount: "$100.00",
      type: "buy",
      status: "completed",
    },
    {
      id: "2",
      date: "2024-01-2",
      amount: "$100.00",
      type: "sell",
      status: "completed",
    },
    {
      id: "3",
      date: "2024-01-3",
      amount: "$100.00",
      type: "deposit",
      status: "completed",
    },
    {
      id: "4",
      date: "2024-01-4",
      amount: "$75.50",
      type: "reward",
      status: "completed",
    },
    {
      id: "5",
      date: "2024-01-5",
      amount: "$210.25",
      type: "buy",
      status: "pending",
    },
  ];

  const eventsCreated = [
    {
      id: "6",
      title: "2025 PGA Champion",
      description:
        "Place your bets on the winner of the 2025 PGA Championship.",
      volume: "$1m Vol.",
      createdAt: new Date("2023-10-01"),
      closingAt: new Date("2025-06-01T10:00:00Z"),
      creatorName: "Ryan Reynolds",
    },
    {
      id: "7",
      title: "US Presidential Election 2028",
      description: "Predict the winner of the 2028 US Presidential Election.",
      volume: "$5.2m Vol.",
      createdAt: new Date("2023-12-15"),
      closingAt: new Date("2028-11-07T10:00:00Z"),
      creatorName: "Ryan Reynolds",
    },
  ];

  const eventsParticipated = [
    {
      id: "1",
      name: "2025 PGA Champion",
      participatedOn: "2024-01-1",
    },
  ];

  const rewards = [
    {
      id: "1",
      name: "First Win Streak",
      amount: "$50.00",
      date: "2024-02-15",
      type: "streak",
      icon: "trophy",
    },
    {
      id: "2",
      name: "NFL Championship Prediction",
      amount: "$150.00",
      date: "2024-03-10",
      type: "win",
      icon: "award",
    },
    {
      id: "3",
      name: "Friend Referral Bonus",
      amount: "$25.00",
      date: "2024-03-22",
      type: "referral",
      icon: "gift",
    },
    {
      id: "4",
      name: "VIP Status Achievement",
      amount: "$75.00",
      date: "2024-04-05",
      type: "achievement",
      icon: "star",
    },
    {
      id: "5",
      name: "Perfect Prediction Bonus",
      amount: "$100.00",
      date: "2024-04-18",
      type: "win",
      icon: "zap",
    },
  ];

  const [activeTab, setActiveTab] = useState("transactions");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getRewardIcon = (iconType: string) => {
    switch (iconType) {
      case "trophy":
        return <Trophy size={18} className="text-orange-500" />;
      case "award":
        return <Award size={18} className="text-orange-500" />;
      case "gift":
        return <Gift size={18} className="text-orange-500" />;
      case "star":
        return <Star size={18} className="text-orange-500" />;
      case "zap":
        return <Zap size={18} className="text-orange-500" />;
      default:
        return <Award size={18} className="text-orange-500" />;
    }
  };

  // Calculate total rewards
  const totalRewards = rewards
    .reduce(
      (total, reward) => total + parseFloat(reward.amount.replace("$", "")),
      0
    )
    .toFixed(2);

  return (
    <div className="min-h-screen text-white flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4 bg-black">
      {/* Back button */}
      <div className="w-full max-w-4xl mb-4 sm:mb-8 px-2 sm:px-0">
        <button className="text-gray-300 hover:text-orange-500 flex items-center gap-2 transition-colors group">
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform duration-200"
          />
          <Link to="/">Go Back</Link>
        </button>
      </div>

      {/* Profile card */}
      <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-zinc-800 bg-black">
        {/* Profile info */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6  relative z-10 mt-2">
          {/* Avatar with glow effect */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-4 border-black relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-300 -z-10"></div>
            <img
              src={userData?.profile_pic ?? ""}
              alt={userData?.username}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User info */}
          <div className="flex-1 flex flex-col items-center sm:items-start">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    @{userData?.username}
                  </span>
                </h1>
                <p className="text-gray-400 mb-3 text-center sm:text-left">
                  {userData?.about}
                </p>

                {/* Wallet info with copy - Mobile Responsive */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 sm:mt-0">
                  <span className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {formatWalletAddress(wallets[0].address)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(wallets[0].address)}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle size={16} className="text-orange-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <a
                    href={`https://etherscan.io/address/${wallets[0].address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsEditModalOpen(true);
                }}
                className="bg-zinc-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 flex items-center gap-2 text-sm group mt-2 sm:mt-0 md:mt-12"
              >
                <Edit3
                  size={16}
                  className="text-orange-500 group-hover:rotate-12 transition-transform duration-200"
                />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 border-t border-b border-zinc-800 bg-gradient-to-r from-zinc-900/50 via-black to-zinc-900/50">
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              12
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">
              Predictions
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              8
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">Wins</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              $580
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">Earnings</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              67%
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">Win Rate</span>
          </div>
        </div>

        {/* Navigation tabs - Mobile Responsive */}
        <div className="flex overflow-x-auto bg-zinc-900/30">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "transactions"
                ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80"
                : "text-gray-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Activity size={14} className="hidden sm:inline" />
            <span>Transactions</span>
          </button>
          <button
            onClick={() => setActiveTab("participation")}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "participation"
                ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80"
                : "text-gray-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Calendar size={14} className="hidden sm:inline" />
            <span>Events</span>
          </button>
          <button
            onClick={() => setActiveTab("created")}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "created"
                ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80"
                : "text-gray-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Clock size={14} className="hidden sm:inline" />
            <span>Created</span>
          </button>
          <button
            onClick={() => setActiveTab("rewards")}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
              activeTab === "rewards"
                ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80"
                : "text-gray-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Award size={14} className="hidden sm:inline" />
            <span>Rewards</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-black to-zinc-900/30">
          {activeTab === "transactions" && (
            <div>
              <div className="grid grid-cols-12 gap-2 sm:gap-4 pb-3 mb-2 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm">
                {/* <div className="col-span-1"></div> */}
                <div className="col-span-5 md:col-span-4">Transaction</div>
                <div className="col-span-3 md:col-span-4 text-center hidden sm:block">
                  Date
                </div>
                <div className="col-span-6 sm:col-span-3 text-right">
                  Amount
                </div>
              </div>

              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-12 gap-2 sm:gap-4 py-3 sm:py-4 border-b border-zinc-800/50 items-center hover:bg-zinc-900/30 rounded-lg transition-all duration-300 px-2 group"
                >
                  <div className="col-span-5 md:col-span-4">
                    <div className="font-medium text-white text-sm sm:text-base">
                      Transaction #{tx.id}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {tx.type} • {tx.status}
                      {tx.status === "pending" && (
                        <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 sm:hidden mt-1">
                      {tx.date}
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-4 text-center text-gray-400 hidden sm:block">
                    {tx.date}
                  </div>
                  <div className="col-span-6 sm:col-span-3 text-right font-medium group-hover:text-orange-500 transition-colors">
                    {tx.amount}
                  </div>
                </div>
              ))}

              <div className="mt-6 text-center">
                <button className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300">
                  View All Transactions
                </button>
              </div>
            </div>
          )}

          {activeTab === "participation" &&
            (eventsParticipated && eventsParticipated.length > 0 ? (
              <div>
                <div className="grid grid-cols-12 gap-2 sm:gap-4 pb-3 mb-2 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm">
                  <div className="col-span-1"></div>
                  <div className="col-span-7 md:col-span-7">Event Name</div>
                  <div className="col-span-4 md:col-span-4 text-right">
                    Participated On
                  </div>
                </div>

                {eventsParticipated.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-12 gap-2 sm:gap-4 py-3 sm:py-4 border-b border-zinc-800/50 items-center hover:bg-zinc-900/30 rounded-lg transition-all duration-300 px-2 group"
                  >
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 hidden md:flex">
                        <Calendar size={16} />
                      </div>
                    </div>
                    <div className="col-span-7 md:col-span-7">
                      <div className="font-medium text-white text-sm sm:text-base">
                        {event.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Event #{event.id}
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-4 text-right font-medium group-hover:text-orange-500 transition-colors text-sm">
                      {event.participatedOn}
                    </div>
                  </div>
                ))}

                <div className="mt-6 text-center">
                  <button className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300">
                    View All Participations
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 text-gray-400">
                <div className="mb-4">
                  <Calendar
                    size={40}
                    className="mx-auto text-orange-500 opacity-30"
                  />
                </div>
                <h3 className="text-base sm:text-lg text-white mb-2">
                  No Event Participation Yet
                </h3>
                <p className="text-sm">
                  Start participating in prediction events to see your history
                  here.
                </p>
                <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                  Explore Events
                </button>
              </div>
            ))}

          {activeTab === "created" &&
            (eventsCreated && eventsCreated.length > 0 ? (
              <div>
                <div className="mb-4 sm:mb-6 pb-3 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-white text-base sm:text-lg font-medium">
                    My Created Events
                  </h3>
                  <button className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-xs sm:text-sm hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300">
                    <Link to="/create-prediction">Create New Event</Link>
                  </button>
                </div>

                {/* Mobile responsive market cards */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {eventsCreated.map((event) => (
                    <div
                      key={event.id}
                      className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500/30 group"
                    >
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500/20 to-black flex-shrink-0 border border-zinc-800 group-hover:border-orange-500/30 transition-all duration-300">
                          <img
                            src="/api/placeholder/56/56"
                            alt={event.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 group-hover:text-orange-500 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Clock size={12} className="text-orange-500" />
                              <span>
                                Created: {event.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Calendar size={12} className="text-orange-500" />
                              <span>
                                Closes: {event.closingAt.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Award size={12} className="text-orange-500" />
                              <span>{event.volume}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-3 sm:gap-3 items-center sm:items-end w-full sm:w-auto mt-3 sm:mt-0 justify-between">
                          <span className="bg-orange-500/10 text-orange-400 text-xs px-3 py-1 rounded-full border border-orange-500/20">
                            Active
                          </span>
                          <button className="text-xs bg-zinc-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-800 transition-all duration-300">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300">
                    View All Events
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 text-gray-400">
                <div className="mb-4">
                  <Clock
                    size={40}
                    className="mx-auto text-orange-500 opacity-30"
                  />
                </div>
                <h3 className="text-base sm:text-lg text-white mb-2">
                  No Events Created Yet
                </h3>
                <p className="text-sm">
                  Create your first prediction event to see it listed here.
                </p>
                <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                  Create Event
                </button>
              </div>
            ))}

          {activeTab === "rewards" &&
            (rewards && rewards.length > 0 ? (
              <div>
                <div className="mb-4 sm:mb-6 pb-3 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-white text-base sm:text-lg font-medium">
                    Reward History
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Total Rewards:{" "}
                    <span className="text-orange-500 font-bold">
                      ${totalRewards}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-zinc-900/30 rounded-lg border border-zinc-800 hover:border-orange-500/30 p-3 sm:p-4 flex items-center justify-between transition-all duration-300 group hover:bg-zinc-900/50"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-black flex items-center justify-center">
                          {getRewardIcon(reward.icon)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white group-hover:text-orange-500 transition-colors text-sm sm:text-base">
                            {reward.name}
                          </h4>
                          <p className="text-xs text-gray-400">{reward.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-orange-500 text-sm sm:text-base">
                          {reward.amount}
                        </span>
                        <p className="text-xs text-gray-400 capitalize">
                          {reward.type} Reward
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
                  <span className="text-xs sm:text-sm text-gray-400 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900/50 rounded-lg">
                    <span className="text-orange-500 font-bold">5</span> rewards
                    earned
                  </span>
                  <button className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300">
                    Claim All Rewards
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 text-gray-400">
                <div className="mb-4">
                  <Award
                    size={40}
                    className="mx-auto text-orange-500 opacity-30"
                  />
                </div>
                <h3 className="text-base sm:text-lg text-white mb-2">
                  No Rewards Yet
                </h3>
                <p className="text-sm">
                  Win predictions to earn rewards and see them here.
                </p>
                <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                  Participate Now
                </button>
              </div>
            ))}
        </div>

        {/* Footer with subtle branding and glow effect */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/50 bg-black">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <span className="text-sm text-gray-400">
                SpreddAI Predictions
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">
                Terms
              </button>
              <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">
                Privacy
              </button>
              <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action button - visible on mobile only */}
      <div className="fixed bottom-4 right-4 sm:hidden z-20">
        <button className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-orange-500/20 transform hover:scale-105 transition-all duration-300">
          <Zap size={20} className="text-white" />
        </button>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={{
          username: userData?.username,
          profile_pic: userData?.profile_pic || "",
          about: userData?.about,
        }}
      />
    </div>
  );
};

export default UserProfile;
