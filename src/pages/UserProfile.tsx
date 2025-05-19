import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Edit3, Copy, CheckCircle, Activity, Award, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Transaction {
  id: string;
  date: string;
  amount: string;
  type: 'buy' | 'sell' | 'deposit' | 'reward';
  status: 'completed' | 'pending' | 'failed';
}

interface Event {
  id: string;
  title: string;
  icon: string;
  description: string;
  volume: string;
  createdAt: Date;
  closingAt: Date;
  creatorName: string;
}

interface EventParticipation {
  id: string;
  name: string;
  participatedOn: string;
}

interface ProfileDashboardProps {
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  walletAddress?: string;
  transactions?: Transaction[];
  eventsCreated?: Event[];
  eventsParticipated?: EventParticipation[];
}

const UserProfile: React.FC<ProfileDashboardProps> = ({
  username = 'SwiftWhale368',
  bio = 'Hey I am SwiftWhale368 and I love Bango',
  avatar = 'https://i.imgur.com/8Km9tLL.png',
  walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  transactions = [
    { id: '1', date: '2024-01-1', amount: '$100.00', type: 'buy', status: 'completed' },
    { id: '2', date: '2024-01-2', amount: '$100.00', type: 'sell', status: 'completed' },
    { id: '3', date: '2024-01-3', amount: '$100.00', type: 'deposit', status: 'completed' },
    { id: '4', date: '2024-01-4', amount: '$75.50', type: 'reward', status: 'completed' },
    { id: '5', date: '2024-01-5', amount: '$210.25', type: 'buy', status: 'pending' },
  ],
  eventsCreated = [
    {
      id: "6",
      title: "2025 PGA Champion",
      icon: "src/assets/arsenal.jpeg",
      description: "Place your bets on the winner of the 2025 PGA Championship.",
      volume: "$1m Vol.",
      createdAt: new Date("2023-10-01"),
      closingAt: new Date("2025-06-01T10:00:00Z"),
      creatorName: "Ryan Reynolds",
    },
    {
      id: "7",
      title: "US Presidential Election 2028",
      icon: "src/assets/politics.jpeg",
      description: "Predict the winner of the 2028 US Presidential Election.",
      volume: "$5.2m Vol.",
      createdAt: new Date("2023-12-15"),
      closingAt: new Date("2028-11-07T10:00:00Z"),
      creatorName: "Ryan Reynolds",
    },
  ],
  eventsParticipated = [
    {
      id: "1",
      name: "2025 PGA Champion",
      participatedOn: "2024-01-1",
    }
  ],
}) => {
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
        return <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">↓</div>;
      case 'sell':
        return <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">↑</div>;
      case 'deposit':
        return <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">+</div>;
      case 'reward':
        return <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">★</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-500">•</div>;
    }
  };

  return (
    <div className="min-h-screen  text-white flex flex-col items-center py-8 px-4">
      {/* Back button */}
      <div className="w-full max-w-4xl mb-8">
        <Link to="/" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Go Back</span>
        </Link>
      </div>

      {/* Profile card */}
      <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-1xl border border-zinc-500 ">
        {/* Profile header with background gradient */}
        <div className="relative h-32 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://i.imgur.com/ZSkeqnd.png')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#131831] to-transparent"></div>
        </div>

        {/* Profile info */}
        <div className="px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-6 -mt-16 relative z-10">
          {/* Avatar with glow effect */}
          <div className="w-28 h-28 rounded-xl overflow-hidden border-4 border-[#131831] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img
              src={avatar}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    @{username}
                  </span>
                </h1>
                <p className="text-gray-400 mb-3">{bio}</p>
                
                {/* Wallet info with copy */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="bg-[#1a1f3a] px-2 py-1 rounded-md">
                    {formatWalletAddress(walletAddress || '')}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(walletAddress || '')}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
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
              
              <button className="bg-black px-4 py-2 rounded-lg border border-orange-500/50 hover:bg-orange-500/10 transition-colors flex items-center gap-2 text-sm group">
                <Edit3 size={16} className="text-orange-500 group-hover:rotate-12 transition-transform duration-200" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-8 py-4 bg-black/20 border-t border-b border-zinc-500/20">
          <div className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#1a1f3a] transition-colors cursor-pointer">
            <span className="text-orange-500 text-xl font-bold">12</span>
            <span className="text-gray-400 text-sm">Predictions</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#1a1f3a] transition-colors cursor-pointer">
            <span className="text-orange-500 text-xl font-bold">8</span>
            <span className="text-gray-400 text-sm">Wins</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#1a1f3a] transition-colors cursor-pointer">
            <span className="text-orange-500 text-xl font-bold">$580</span>
            <span className="text-gray-400 text-sm">Earnings</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[#1a1f3a] transition-colors cursor-pointer">
            <span className="text-orange-500 text-xl font-bold">67%</span>
            <span className="text-gray-400 text-sm">Win Rate</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Activity size={16} />
            <span>Transactions</span>
          </button>
          <button 
            onClick={() => setActiveTab('participation')}
            className={`px-6 py-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'participation' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Calendar size={16} />
            <span>Event Participation</span>
          </button>
          <button 
            onClick={() => setActiveTab('created')}
            className={`px-6 py-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'created' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Clock size={16} />
            <span>Events Created</span>
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`px-6 py-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'rewards' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            <Award size={16} />
            <span>Rewards</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6">
          {activeTab === 'transactions' && (
            <div>
              <div className="grid grid-cols-12 gap-4 pb-3 mb-2 border-b border-[#252b43] text-gray-400 text-sm">
                <div className="col-span-1"></div>
                <div className="col-span-5 md:col-span-4">Transaction</div>
                <div className="col-span-3 md:col-span-4 text-center">Date</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>

              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="grid grid-cols-12 gap-4 py-4 border-b border-[#252b43]/50 items-center hover:bg-[#1a1f3a]/30 rounded-lg transition-colors px-2 group"
                >
                  <div className="col-span-1">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="col-span-5 md:col-span-4">
                    <div className="font-medium text-white">Transaction #{tx.id}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {tx.type} • {tx.status}
                      {tx.status === 'pending' && (
                        <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-4 text-center text-gray-400">{tx.date}</div>
                  <div className="col-span-3 text-right font-medium group-hover:text-orange-500 transition-colors">
                    {tx.amount}
                  </div>
                </div>
              ))}
              
              <div className="mt-6 text-center">
                <button className="px-4 py-2 bg-[#1a1f3a] rounded-lg text-sm text-gray-300 hover:bg-[#252b43] transition-colors">
                  View All Transactions
                </button>
              </div>
            </div>
          )}

          {activeTab === 'participation' && (
            eventsParticipated && eventsParticipated.length > 0 ? (
              <div>
                <div className="grid grid-cols-12 gap-4 pb-3 mb-2 border-b border-[#252b43] text-gray-400 text-sm">
                  <div className="col-span-1"></div>
                  <div className="col-span-7 md:col-span-7">Event Name</div>
                  <div className="col-span-4 md:col-span-4 text-right">Participated On</div>
                </div>
                
                {eventsParticipated.map((event) => (
                  <div 
                    key={event.id}
                    className="grid grid-cols-12 gap-4 py-4 border-b border-[#252b43]/50 items-center hover:bg-[#1a1f3a]/30 rounded-lg transition-colors px-2 group"
                  >
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Calendar size={16} />
                      </div>
                    </div>
                    <div className="col-span-7 md:col-span-7">
                      <div className="font-medium text-white">{event.name}</div>
                      <div className="text-xs text-gray-400">
                        Event #{event.id}
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-4 text-right font-medium group-hover:text-orange-500 transition-colors">
                      {event.participatedOn}
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 text-center">
                  <button className="px-4 py-2 bg-[#1a1f3a] rounded-lg text-sm text-gray-300 hover:bg-[#252b43] transition-colors">
                    View All Participations
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="mb-4">
                  <Calendar size={48} className="mx-auto text-gray-500" />
                </div>
                <h3 className="text-lg text-white mb-2">No Event Participation Yet</h3>
                <p>Start participating in prediction events to see your history here.</p>
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors">
                  Explore Events
                </button>
              </div>
            )
          )}

          {activeTab === 'created' && (
            eventsCreated && eventsCreated.length > 0 ? (
              <div>
                <div className="mb-4 pb-3 border-b border-[#252b43] text-gray-400 text-sm flex justify-between items-center">
                  <h3 className="text-white text-lg font-medium">My Created Events</h3>
                  <button className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-sm hover:from-orange-600 hover:to-orange-700 transition-colors">
                    Create New Event
                  </button>
                </div>
                
                {/* Custom styled market cards to match the dashboard */}
                <div className="grid grid-cols-1 gap-6">
                  {eventsCreated.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-gradient-to-b from-[#111] to-[#0a0a0a]  rounded-xl border border-[#252b43] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500/30"
                    >
                      <div className="p-5 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-800 to-black flex-shrink-0">
                          <img src={event.icon} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-white text-lg font-medium mb-2">{event.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Clock size={14} className="text-orange-500" />
                              <span>Created: {event.createdAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Calendar size={14} className="text-orange-500" />
                              <span>Closes: {event.closingAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Award size={14} className="text-orange-500" />
                              <span>{event.volume}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-end">
                          <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">Active</span>
                          <button className="text-xs bg-[#1a1f3a] px-3 py-1.5 rounded-lg text-white hover:bg-[#252b43] transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="px-4 py-2 bg-[#1a1f3a] rounded-lg text-sm text-gray-300 hover:bg-[#252b43] transition-colors">
                    View All Events
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="mb-4">
                  <Clock size={48} className="mx-auto text-gray-500" />
                </div>
                <h3 className="text-lg text-white mb-2">No Events Created Yet</h3>
                <p>Create your first prediction event to see it listed here.</p>
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors">
                  Create Event
                </button>
              </div>
            )
          )}

          {activeTab === 'rewards' && (
            <div className="text-center py-10 text-gray-400">
              <div className="mb-4">
                <Award size={48} className="mx-auto text-gray-500" />
              </div>
              <h3 className="text-lg text-white mb-2">No Rewards Yet</h3>
              <p>Win predictions to earn rewards and see them here.</p>
              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors">
                Participate Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;