import {
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Star,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useLogin } from "@privy-io/react-auth";

const LogOut = () => {
  const { login } = useLogin();

  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: "Prediction Markets",
      description: "Create and trade on real-world events with cryptocurrency",
    },
    {
      icon: <Shield size={24} />,
      title: "Secure & Decentralized",
      description: "Built on blockchain for transparency and security",
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Rewards",
      description: "Get rewarded for accurate predictions instantly",
    },
    {
      icon: <Users size={24} />,
      title: "Community Driven",
      description: "Join thousands of traders in prediction markets",
    },
  ];

  const stats = [
    { label: "Active Markets", value: "150+" },
    { label: "Total Volume", value: "$2.5M" },
    { label: "Users", value: "10K+" },
    { label: "Success Rate", value: "89%" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-orange-500/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Main Content Container */}
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <Sparkles size={40} className="text-white" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent leading-tight">
              Spredd Markets
              <span className="block text-3xl md:text-4xl mt-2 text-gray-300">
                Prediction Platform
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Trade on the future of real-world events. Make predictions, earn
              rewards, and join the decentralized prediction economy.
            </p>

            {/* CTA Button */}
            <button
              onClick={login}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40"
            >
              <Wallet size={24} />
              Connect Wallet to Start
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
            </button>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
              <Shield size={16} />
              <span>Secured by blockchain technology</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-orange-500/30 hover:bg-zinc-800/50 hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full transition-all duration-300 hover:border-orange-500/30 hover:bg-zinc-800/50 hover:transform hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                    <div className="text-orange-500">{feature.icon}</div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Predicting?
              </h3>
              <p className="text-gray-400 mb-6">
                Join thousands of traders making money from accurate predictions
              </p>
              <button
                onClick={login}
                className="group inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:scale-105"
              >
                Get Started Now
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 text-orange-500/20">
          <Star size={24} className="animate-pulse" />
        </div>
        <div className="absolute bottom-10 left-10 text-orange-500/20">
          <Zap size={32} className="animate-pulse delay-1000" />
        </div>
      </div>
    </div>
  );
};

export default LogOut;
