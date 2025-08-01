import { usePrivy } from "@privy-io/react-auth";
import { Link, useLocation } from "react-router-dom";
import { FaExternalLinkAlt, FaDollarSign, FaUser } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { getBalance } from "@wagmi/core";
import { formatUnits } from "viem";
import { UserRound, Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { loginApi } from "../apis/auth";
import { useToast } from "../hooks/useToast";
import { useAtom } from "jotai";
import { balanceAtom, refreshUserAtom, userAtom } from "../atoms/user";
import { CONTRACT_ADDRESSES, wagmiConfig } from "../utils/wagmiConfig";
import { baseSepolia } from "viem/chains";
import { useSwitchChain } from "wagmi";

const Navbar = () => {
  const location = useLocation();
  const [networkName] = useState("Base");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingBalance] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const { switchChain } = useSwitchChain();

  const { login, authenticated, logout, getAccessToken, user, ready } =
    usePrivy();

  const [userBalance, setUserBalance] = useAtom(balanceAtom);

  const { success, error: toastError } = useToast();
  const [, setUser] = useAtom(userAtom);
  const [refreshUser] = useAtom(refreshUserAtom);

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Format address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if route is active
  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        !profileButtonRef.current?.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    switchChain({ chainId: baseSepolia.id });
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchBalance() {
      const balance = await getBalance(wagmiConfig, {
        address: user?.wallet?.address as `0x${string}`,
        token: CONTRACT_ADDRESSES.token,
      });
      setUserBalance(balance);
    }

    if (user) {
      fetchBalance(); // Initial fetch
      intervalId = setInterval(fetchBalance, 2000); // Fetch every 2s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [authenticated, user, ready]);

  useEffect(() => {
    if (!authenticated) return;

    getAccessToken()
      .then(async (authToken) => {
        const [data, status] = await loginApi(authToken!);

        if (status === -1) {
          toastError("Failed to login!", 2);
          return;
        }

        setUser(data);
        success("Welcome to Spredd!", 2);
      })
      .catch((error) => {
        console.error("Error: ", error);
        toastError("Something went wrong!", 2);
      });
  }, [authenticated, refreshUser]);

  const navigationLinks = [
    { name: "Explore", to: "/" },
    { name: "Faucet", to: "/faucet" },
    { name: "Leaderboard", to: "/leaderboard" },
    { name: "Stake", to: "/stake" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a] border-b border-gray-800/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.jpg"
                alt="SPREDD MARKETS Logo"
                className="h-8 w-auto mr-3 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-xl font-bold">
                <span className="text-white">SPREDD</span>
                <span className="text-[#ff6b35] ml-1">MARKETS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="relative group px-4 py-2 text-gray-300 hover:text-white font-medium text-sm transition-all duration-300"
              >
                <span className="relative z-10">{link.name}</span>

                {/* Orange indicator bar */}
                <div
                  className={`
    absolute bottom-[-13px] left-1/2 -translate-x-1/2 h-[1px]
    bg-[linear-gradient(90deg,#ff6b35,#ff9f1c,#ffd166,#ff6b35)]
    bg-[length:200%_100%] animate-[gradient-move_4s_linear_infinite]
    rounded-full transition-all duration-300
    ${
      isActiveRoute(link.to)
        ? "w-16 opacity-100"
        : "w-0 opacity-0 group-hover:w-8 group-hover:opacity-100"
    }
  `}
                />

                {/* Subtle background on hover */}
                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}

            {/* Buy Token Button */}
            <Link
              to="https://app.virtuals.io/geneses/1057"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center ml-4 px-4 py-2 border border-[#ff6b35]/30 rounded-lg text-[#ff6b35] hover:bg-[#ff6b35]/10 transition-all duration-300 font-medium text-sm"
            >
              <span className="flex items-center">
                Buy $SPRDD
                <FaExternalLinkAlt className="ml-2 h-3 w-3" />
              </span>
            </Link>

            {/* Create Prediction Button */}
            <Link
              to="/create-prediction"
              className="ml-2 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff6b35]/20 text-sm"
            >
              Create Prediction
            </Link>
          </div>

          {/* Desktop Profile/Auth Section */}
          <div className="hidden md:flex items-center">
            {authenticated ? (
              <div className="relative">
                {/* Profile Button */}
                <button
                  ref={profileButtonRef}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`
                    relative p-2 rounded-full transition-all duration-300 transform border
                    ${
                      showProfileDropdown
                        ? "bg-[#ff6b35] text-black border-[#ff6b35] rotate-180 scale-110"
                        : "text-gray-300 border-gray-700 hover:border-[#ff6b35]/50 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <UserRound className="h-5 w-5" />

                  {/* Active indicator */}
                  {showProfileDropdown && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#ff6b35] rounded-full" />
                  )}
                </button>

                {/* Enhanced Profile Dropdown */}
                {showProfileDropdown && (
                  <div
                    ref={profileDropdownRef}
                    className="absolute right-0 mt-3 w-80 bg-[#111111] border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
                  >
                    {/* Profile Header */}
                    <div className="px-5 py-4 border-b border-gray-800/50 bg-gradient-to-r from-[#ff6b35]/5 to-transparent">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-base">
                            My Profile
                          </h3>
                          <p className="text-sm text-gray-400 mt-1 flex items-center">
                            <span className="bg-green-500 w-2 h-2 rounded-full mr-2 animate-pulse"></span>
                            Connected to {networkName}
                          </p>
                        </div>
                        <div className="bg-[#ff6b35]/10 h-12 w-12 rounded-full flex items-center justify-center text-[#ff6b35] border border-[#ff6b35]/20">
                          <UserRound size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Wallet Section */}
                    <div className="px-5 py-4 border-b border-gray-800/30">
                      <h4 className="text-sm text-gray-400 mb-3 flex items-center font-medium">
                        <Wallet size={14} className="mr-2 text-[#ff6b35]" />
                        Wallet Address
                      </h4>

                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm text-white flex items-center bg-gray-800/30 px-3 py-1.5 rounded-lg">
                          <span className="font-mono">
                            {formatAddress(user?.wallet?.address)}
                          </span>
                          <button
                            onClick={() =>
                              user?.wallet?.address &&
                              copyToClipboard(user.wallet.address)
                            }
                            className="ml-2 text-gray-400 hover:text-[#ff6b35] transition-colors p-1"
                          >
                            {copySuccess ? (
                              <span className="text-green-500 text-xs font-medium">
                                Copied!
                              </span>
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </p>
                        <Link
                          to={`https://basescan.org/address/${user?.wallet?.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff6b35] hover:text-[#ff8c42] text-xs flex items-center font-medium"
                        >
                          View <ExternalLink size={12} className="ml-1" />
                        </Link>
                      </div>

                      <div className="flex justify-between items-center bg-gray-800/20 px-3 py-2 rounded-lg">
                        <p className="text-sm text-gray-400 font-medium">
                          Balance
                        </p>
                        <p className="text-sm font-semibold text-white flex items-center">
                          <FaDollarSign className="h-3 w-3 mr-1 text-[#ff6b35]" />
                          {isLoadingBalance ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : userBalance ? (
                            <span>
                              {parseFloat(
                                formatUnits(BigInt(userBalance?.value), 6)
                              ).toFixed(4)}{" "}
                              USD
                            </span>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Profile Actions */}
                    <div className="px-2 py-2">
                      <Link
                        to="/user/profile"
                        className="flex items-center px-3 py-2.5 text-sm text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
                      >
                        <FaUser className="h-4 w-4 mr-3 text-[#ff6b35] group-hover:scale-110 transition-transform" />
                        <span className="font-medium">My Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                        }}
                        className="flex items-center px-3 py-2.5 w-full text-left text-sm text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 group"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-400 group-hover:text-red-400 group-hover:scale-110 transition-all" />
                        <span className="font-medium">Disconnect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-black font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff6b35]/20 text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-gray-800/50 backdrop-blur-xl">
          {/* Navigation Links */}
          <div className="px-4 py-4 space-y-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className={`
                  block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${
                    isActiveRoute(link.to)
                      ? "text-[#ff6b35] bg-[#ff6b35]/10 border-l-2 border-[#ff6b35]"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="https://app.virtuals.io/geneses/1057"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-lg transition-all duration-200 font-medium text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy $SPRDD
              <FaExternalLinkAlt className="ml-2 h-3 w-3" />
            </Link>

            <Link
              to="/create-prediction"
              className="block px-4 py-3 text-center bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-black font-semibold rounded-lg text-sm mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create Prediction
            </Link>
          </div>

          {/* Mobile Wallet Section */}
          <div className="px-4 py-4 border-t border-gray-800/50">
            {authenticated ? (
              <div className="space-y-3">
                <Link
                  to="/user/profile"
                  className="flex items-center px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4 mr-3 text-[#ff6b35]" />
                  My Profile
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-left text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  login();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-black font-semibold px-6 py-3 rounded-lg text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
