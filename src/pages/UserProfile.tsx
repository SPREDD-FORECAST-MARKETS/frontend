import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Edit3, Copy, CheckCircle, Activity, Award, Calendar, Clock, Trophy, Gift, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  // Sample data
  const username = 'SwiftWhale368';
  const bio = 'Hey I am SwiftWhale368 and I love Bango';
  const avatar = 'data:image/jpeg;base64,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';
  const walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  
  const transactions = [
    { id: '1', date: '2024-01-1', amount: '$100.00', type: 'buy', status: 'completed' },
    { id: '2', date: '2024-01-2', amount: '$100.00', type: 'sell', status: 'completed' },
    { id: '3', date: '2024-01-3', amount: '$100.00', type: 'deposit', status: 'completed' },
    { id: '4', date: '2024-01-4', amount: '$75.50', type: 'reward', status: 'completed' },
    { id: '5', date: '2024-01-5', amount: '$210.25', type: 'buy', status: 'pending' },
  ];
  
  const eventsCreated = [
    {
      id: "6",
      title: "2025 PGA Champion",
      description: "Place your bets on the winner of the 2025 PGA Championship.",
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
    }
  ];
  
  const rewards = [
    {
      id: "1",
      name: "First Win Streak",
      amount: "$50.00",
      date: "2024-02-15",
      type: "streak",
      icon: "trophy"
    },
    {
      id: "2",
      name: "NFL Championship Prediction",
      amount: "$150.00",
      date: "2024-03-10",
      type: "win",
      icon: "award"
    },
    {
      id: "3",
      name: "Friend Referral Bonus",
      amount: "$25.00",
      date: "2024-03-22",
      type: "referral",
      icon: "gift"
    },
    {
      id: "4",
      name: "VIP Status Achievement",
      amount: "$75.00",
      date: "2024-04-05",
      type: "achievement",
      icon: "star"
    },
    {
      id: "5",
      name: "Perfect Prediction Bonus",
      amount: "$100.00",
      date: "2024-04-18",
      type: "win",
      icon: "zap"
    },
  ];

  const [activeTab, setActiveTab] = useState('transactions');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">↓</div>;
      case 'sell':
        return <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">↑</div>;
      case 'deposit':
        return <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">+</div>;
      case 'reward':
        return <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">★</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-500">•</div>;
    }
  };

  const getRewardIcon = (iconType: string) => {
    switch (iconType) {
      case 'trophy':
        return <Trophy size={18} className="text-orange-500" />;
      case 'award':
        return <Award size={18} className="text-orange-500" />;
      case 'gift':
        return <Gift size={18} className="text-orange-500" />;
      case 'star':
        return <Star size={18} className="text-orange-500" />;
      case 'zap':
        return <Zap size={18} className="text-orange-500" />;
      default:
        return <Award size={18} className="text-orange-500" />;
    }
  };

  // Calculate total rewards
  const totalRewards = rewards.reduce((total, reward) => total + parseFloat(reward.amount.replace('$', '')), 0).toFixed(2);

  return (
    <div className="min-h-screen text-white flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4 bg-black">
      {/* Back button */}
      <div className="w-full max-w-4xl mb-4 sm:mb-8 px-2 sm:px-0">
        <button className="text-gray-300 hover:text-orange-500 flex items-center gap-2 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
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
              src={avatar}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User info */}
          <div className="flex-1 flex flex-col items-center sm:items-start">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    @{username}
                  </span>
                </h1>
                <p className="text-gray-400 mb-3 text-center sm:text-left">{bio}</p>
                
                {/* Wallet info with copy - Mobile Responsive */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 sm:mt-0">
                  <span className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {formatWalletAddress(walletAddress)}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(walletAddress)}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {copied ? <CheckCircle size={16} className="text-orange-500" /> : <Copy size={16} />}
                  </button>
                  <a 
                    href={`https://etherscan.io/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              
              <button className="bg-zinc-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 flex items-center gap-2 text-sm group mt-2 sm:mt-0 md:mt-12">
                <Edit3 size={16} className="text-orange-500 group-hover:rotate-12 transition-transform duration-200" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 border-t border-b border-zinc-800 bg-gradient-to-r from-zinc-900/50 via-black to-zinc-900/50">
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">12</span>
            <span className="text-gray-400 text-xs sm:text-sm">Predictions</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">8</span>
            <span className="text-gray-400 text-xs sm:text-sm">Wins</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">$580</span>
            <span className="text-gray-400 text-xs sm:text-sm">Earnings</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">67%</span>
            <span className="text-gray-400 text-xs sm:text-sm">Win Rate</span>
          </div>
        </div>

        {/* Navigation tabs - Mobile Responsive */}
        <div className="flex overflow-x-auto bg-zinc-900/30">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === 'transactions' ? 'text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80' : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Activity size={14} className="hidden sm:inline" />
            <span>Transactions</span>
          </button>
          <button 
            onClick={() => setActiveTab('participation')}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === 'participation' ? 'text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80' : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Calendar size={14} className="hidden sm:inline" />
            <span>Events</span>
          </button>
          <button 
            onClick={() => setActiveTab('created')}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === 'created' ? 'text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80' : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Clock size={14} className="hidden sm:inline" />
            <span>Created</span>
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === 'rewards' ? 'text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80' : 'text-gray-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Award size={14} className="hidden sm:inline" />
            <span>Rewards</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-black to-zinc-900/30">
          {activeTab === 'transactions' && (
            <div>
              <div className="grid grid-cols-12 gap-2 sm:gap-4 pb-3 mb-2 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm">
                <div className="col-span-1"></div>
                <div className="col-span-5 md:col-span-4">Transaction</div>
                <div className="col-span-3 md:col-span-4 text-center hidden sm:block">Date</div>
                <div className="col-span-6 sm:col-span-3 text-right">Amount</div>
              </div>

              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="grid grid-cols-12 gap-2 sm:gap-4 py-3 sm:py-4 border-b border-zinc-800/50 items-center hover:bg-zinc-900/30 rounded-lg transition-all duration-300 px-2 group"
                >
                  <div className="col-span-1">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="col-span-5 md:col-span-4">
                    <div className="font-medium text-white text-sm sm:text-base">Transaction #{tx.id}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {tx.type} • {tx.status}
                      {tx.status === 'pending' && (
                        <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 sm:hidden mt-1">{tx.date}</div>
                  </div>
                  <div className="col-span-3 md:col-span-4 text-center text-gray-400 hidden sm:block">{tx.date}</div>
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

          {activeTab === 'participation' && (
            eventsParticipated && eventsParticipated.length > 0 ? (
              <div>
                <div className="grid grid-cols-12 gap-2 sm:gap-4 pb-3 mb-2 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm">
                  <div className="col-span-1"></div>
                  <div className="col-span-7 md:col-span-7">Event Name</div>
                  <div className="col-span-4 md:col-span-4 text-right">Participated On</div>
                </div>
                
                {eventsParticipated.map((event) => (
                  <div 
                    key={event.id}
                    className="grid grid-cols-12 gap-2 sm:gap-4 py-3 sm:py-4 border-b border-zinc-800/50 items-center hover:bg-zinc-900/30 rounded-lg transition-all duration-300 px-2 group"
                  >
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <Calendar size={16} />
                      </div>
                    </div>
                    <div className="col-span-7 md:col-span-7">
                      <div className="font-medium text-white text-sm sm:text-base">{event.name}</div>
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
                  <Calendar size={40} className="mx-auto text-orange-500 opacity-30" />
                </div>
                <h3 className="text-base sm:text-lg text-white mb-2">No Event Participation Yet</h3>
                <p className="text-sm">Start participating in prediction events to see your history here.</p>
                <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                  Explore Events
                </button>
              </div>
            )
          )}

          {activeTab === 'created' && (
            eventsCreated && eventsCreated.length > 0 ? (
              <div>
                <div className="mb-4 sm:mb-6 pb-3 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-white text-base sm:text-lg font-medium">My Created Events</h3>
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
                          <img src="/api/placeholder/56/56" alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 group-hover:text-orange-500 transition-colors">{event.title}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{event.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Clock size={12} className="text-orange-500" />
                              <span>Created: {event.createdAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Calendar size={12} className="text-orange-500" />
                              <span>Closes: {event.closingAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Award size={12} className="text-orange-500" />
                              <span>{event.volume}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col gap-3 sm:gap-3 items-center sm:items-end w-full sm:w-auto mt-3 sm:mt-0 justify-between">
                          <span className="bg-orange-500/10 text-orange-400 text-xs px-3 py-1 rounded-full border border-orange-500/20">Active</span>
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
                  <Clock size={40} className="mx-auto text-orange-500 opacity-30" />
                </div>
                <h3 className="text-base sm:text-lg text-white mb-2">No Events Created Yet</h3>
                <p className="text-sm">Create your first prediction event to see it listed here.</p>
                <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                  Create Event
                </button>
              </div>
            )
          )}

          {activeTab === 'rewards' && (
            rewards && rewards.length > 0 ? (
              <div>
                <div className="mb-4 sm:mb-6 pb-3 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-white text-base sm:text-lg font-medium">Reward History</h3>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Total Rewards: <span className="text-orange-500 font-bold">${totalRewards}</span>
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
                          <h4 className="font-medium text-white group-hover:text-orange-500 transition-colors text-sm sm:text-base">{reward.name}</h4>
                          <p className="text-xs text-gray-400">{reward.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-orange-500 text-sm sm:text-base">{reward.amount}</span>
                        <p className="text-xs text-gray-400 capitalize">{reward.type} Reward</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
                  <span className="text-xs sm:text-sm text-gray-400 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900/50 rounded-lg">
                    <span className="text-orange-500 font-bold">5</span> rewards earned
                  </span>
                  <button className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300">
                    Claim All Rewards
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 text-gray-400">
                <div className="mb-4">
                  <Award size={40} className="mx-auto text-orange-500 opacity-30" />
                </div>
                <h3 className="text-base sm:text-lg text-white mb-2">No Rewards Yet</h3>
                <p className="text-sm">Win predictions to earn rewards and see them here.</p>
                <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                  Participate Now
                </button>
              </div>
            )
          )}
        </div>
        
        {/* Footer with subtle branding and glow effect */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/50 bg-black">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">B</div>
              <span className="text-sm text-gray-400">Bango Predictions</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">Terms</button>
              <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">Privacy</button>
              <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">Help</button>
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
    </div>
  );
};

export default UserProfile;