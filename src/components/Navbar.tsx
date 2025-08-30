import { usePrivy } from "@privy-io/react-auth";
import { Link, useLocation } from "react-router-dom";
import { FaExternalLinkAlt, FaDollarSign, FaUser } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { formatUnits } from "viem";
import { UserRound, Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { loginApi } from "../apis/auth";
import { useToast } from "../hooks/useToast";
import { useAtom } from "jotai";
import { balanceAtom, refreshUserAtom, userAtom } from "../atoms/global";
import { base } from "viem/chains";
import { useSwitchChain, useReadContract } from "wagmi";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const Navbar = () => {
  const location = useLocation();
  const [networkName] = useState("Base");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const { switchChain } = useSwitchChain();

  const { login, authenticated, logout, getAccessToken, user, } =
    usePrivy();

  const [, setUserBalance] = useAtom(balanceAtom);

  const { success, error: toastError } = useToast();
  const [, setUser] = useAtom(userAtom);
  const [refreshUser] = useAtom(refreshUserAtom);

  // Read USDC balance
  const { data: usdcBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: user?.wallet?.address ? [user.wallet.address as `0x${string}`] : undefined,
    query: {
      enabled: !!user?.wallet?.address,
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  });

  // Update balance atom when USDC balance changes
  useEffect(() => {
    if (usdcBalance !== undefined) {
      setUserBalance({
        value: usdcBalance,
        decimals: 6,
        formatted: formatUnits(usdcBalance, 6),
        symbol: "USDC"
      });
    }
  }, [usdcBalance, setUserBalance]);

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

  // Get display info (Twitter profile or wallet)
  const getDisplayInfo = () => {
    if (user?.twitter) {
      return {
        type: 'twitter',
        name: user.twitter.name || user.twitter.username || 'Twitter User',
        username: user.twitter.username ? `@${user.twitter.username}` : '',
        avatar: user.twitter.profilePictureUrl || '',
        identifier: user.twitter.username
      };
    }
    return {
      type: 'wallet',
      name: 'Wallet User',
      username: formatAddress(user?.wallet?.address),
      avatar: '',
      identifier: user?.wallet?.address
    };
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

  // Switch to Base mainnet on load
  useEffect(() => {
    switchChain({ chainId: base.id });
  }, [switchChain]);

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

  // Format balance for display
  const formatBalance = () => {
    if (isLoadingBalance) return "Loading...";
    if (!usdcBalance) return "0.00";
    return parseFloat(formatUnits(usdcBalance, 6)).toFixed(2);
  };

  const navigationLinks = [
    { name: "Explore", to: "/" },
    // { name: "Faucet", to: "/faucet" },
    { name: "Leaderboard", to: "/leaderboard" },
    { name: "Creators", to: "/creators" },
    // { name: "Stake", to: "/stake" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a] border-b border-gray-800/30 backdrop-blur-xl">
      <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px]">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
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
          <div className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="relative group px-3 py-2 text-gray-300 hover:text-white font-medium text-sm transition-all duration-300"
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
              className="group relative flex items-center ml-8 px-4 py-2 border border-[#ff6b35]/30 rounded-lg text-[#ff6b35] hover:bg-[#ff6b35]/10 transition-all duration-300 font-medium text-sm"
            >
              <span className="flex items-center">
                Buy $SPRDD
                <FaExternalLinkAlt className="ml-2 h-3 w-3" />
              </span>
            </Link>

            {/* Create Prediction Button */}
            <Link
              to="/create-prediction"
              className="ml-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff6b35]/20 text-sm"
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
                    relative p-2 rounded-full transition-all duration-300 border
                    ${
                      showProfileDropdown
                        ? "bg-[#ff6b35] text-black border-[#ff6b35]"
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
                            {getDisplayInfo().name}
                          </h3>
                          {getDisplayInfo().type === 'twitter' && getDisplayInfo().username && (
                            <p className="text-sm text-[#ff6b35] font-medium">
                              {getDisplayInfo().username}
                            </p>
                          )}
                          <p className="text-sm text-gray-400 mt-1 flex items-center">
                            <span className="bg-green-500 w-2 h-2 rounded-full mr-2 animate-pulse"></span>
                            {getDisplayInfo().type === 'twitter' ? `Connected via Twitter` : `Connected to ${networkName}`}
                          </p>
                        </div>
                        <div className="bg-[#ff6b35]/10 h-12 w-12 rounded-full flex items-center justify-center text-[#ff6b35] border border-[#ff6b35]/20 overflow-hidden">
                          {getDisplayInfo().avatar ? (
                            <img src={getDisplayInfo().avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserRound size={20} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Info Section */}
                    <div className="px-5 py-4 border-b border-gray-800/30">
                      {getDisplayInfo().type === 'twitter' ? (
                        <div className="space-y-3">
                          <h4 className="text-sm text-gray-400 mb-2 flex items-center font-medium">
                            <svg className="w-4 h-4 mr-2 text-[#ff6b35]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            Twitter Profile
                          </h4>
                          <div className="bg-gray-800/20 px-3 py-2 rounded-lg">
                            <p className="text-sm text-white font-medium">{user?.twitter?.username}</p>
                            <p className="text-xs text-gray-400">{user?.twitter?.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
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
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-gray-800/20 px-3 py-2 rounded-lg mt-3">
                        <p className="text-sm text-gray-400 font-medium">
                          USDC Balance
                        </p>
                        <p className="text-sm font-semibold text-white flex items-center">
                          <FaDollarSign className="h-3 w-3 mr-1 text-[#ff6b35]" />
                          <span>{formatBalance()} USDC</span>
                          {!isLoadingBalance && (
                            <button
                              onClick={() => refetchBalance()}
                              className="ml-2 text-xs text-[#ff6b35] hover:text-[#ff8c42] transition-colors"
                              title="Refresh balance"
                            >
                              ↻
                            </button>
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
                        <span className="font-medium">Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="flex items-center gap-2 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-black font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff6b35]/20 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  viewBox="0 0 48 48"
                  height="16"
                  fill="currentColor"
                >
                  <path fill="none" d="M0 0h48v48H0z"></path>
                  <path
                    d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                  ></path>
                </svg>
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <label className="burger" htmlFor="burger">
              <input 
                type="checkbox" 
                id="burger" 
                checked={isMobileMenuOpen}
                onChange={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
              <span></span>
              <span></span>
              <span></span>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-gray-800/50 backdrop-blur-xl">
          {/* Navigation Links */}
          <div className="px-6 py-6 space-y-3">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className={`
                  block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${
                    isActiveRoute(link.to)
                      ? "text-[#ff6b35] bg-[#ff6b35]/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-gray-800/30 my-4"></div>

            <Link
              to="https://app.virtuals.io/geneses/1057"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-[#ff6b35]/30 rounded-lg text-[#ff6b35] hover:bg-[#ff6b35]/10 transition-all duration-200 font-medium text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy $SPRDD
              <FaExternalLinkAlt className="h-3 w-3" />
            </Link>

            <Link
              to="/create-prediction"
              className="block px-4 py-3 text-center bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-black font-semibold rounded-lg text-sm mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create Prediction
            </Link>
          </div>

          {/* Mobile Profile Section */}
          <div className="px-4 py-4 border-t border-gray-800/50">
            {authenticated && (
              <div className="mb-4 space-y-3">
                {/* Profile Info */}
                <div className="bg-gray-800/20 px-3 py-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#ff6b35]/10 border border-[#ff6b35]/20 overflow-hidden">
                      {getDisplayInfo().avatar ? (
                        <img src={getDisplayInfo().avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserRound size={16} className="text-[#ff6b35]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {getDisplayInfo().name}
                      </p>
                      {getDisplayInfo().type === 'twitter' && getDisplayInfo().username ? (
                        <p className="text-xs text-[#ff6b35]">
                          {getDisplayInfo().username}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 font-mono">
                          {formatAddress(user?.wallet?.address)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Balance */}
                <div className="bg-gray-800/20 px-3 py-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">USDC Balance:</span>
                    <span className="text-sm font-semibold text-white">
                      ${formatBalance()}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  login();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-black font-semibold py-3 px-6 rounded-lg text-base transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  viewBox="0 0 48 48"
                  height="20"
                  fill="currentColor"
                >
                  <path fill="none" d="M0 0h48v48H0z"></path>
                  <path
                    d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                  ></path>
                </svg>
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