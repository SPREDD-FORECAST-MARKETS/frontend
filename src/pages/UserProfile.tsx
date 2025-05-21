import { useState } from 'react';
import { ArrowLeft, ExternalLink, Edit3, Copy, CheckCircle, Activity, Award, Calendar, Clock, Trophy, Gift, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  // Sample data
  const username = 'SwiftWhale368';
  const bio = 'Hey I am SwiftWhale368 and I love SpreddAI!';
  const avatar = "data:image/jpeg;base64,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"
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
              <span className="text-sm text-gray-400">SpreddAI Predictions</span>
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