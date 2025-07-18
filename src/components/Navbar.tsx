import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";
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

  // useEffect(() => {
  //   const fetchAccessToken = async () => {
  //     if (authenticated) {
  //       try {
  //         const token = await getAccessToken();
  //       } catch (error) {
  //         console.error("Error fetching access token:", error);
  //       }
  //     }
  //   };

  //   fetchAccessToken();
  // }, [authenticated, getAccessToken]);

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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex flex-col md:flex-row md:items-center md:justify-between px-4 lg:px-8 py-4 bg-black/50 backdrop-blur-md text-white border-b border-gray-800">

      <div className="flex justify-between items-center md:contents">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.jpg"
              alt="SPREDD MARKETS Logo"
              className="h-10 w-auto mr-3"
            />

            <span className="text-xl md:text-2xl font-extrabold leading-tight">
              <span className="text-white">SPREDD</span>
              <span className="text-orange-500 ml-1">MARKETS</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center items-center space-x-4 lg:space-x-6 text-sm lg:text-base font-medium">
          {[
            { name: "Explore", to: "/" },
            { name: "Faucet", to: "/faucet" },
            { name: "Leaderboard", to: "/leaderboard" },
            { name: "Stake", to: "/" },
          ].map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="relative group px-3 py-2 overflow-hidden"
            >
              <span className="group-hover:text-black relative z-10">{link.name}</span>
              <span className="group-hover:text-black absolute inset-0 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"></span>
            </Link>
          ))}

          <Link
            to="https://app.virtuals.io/geneses/1057"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group flex items-center border border-orange-500 rounded-full px-4 py-2 overflow-hidden hover:bg-orange-500/20 transition-colors duration-300"
          >
            <span className="relative z-10 flex items-center">
              Buy $SPRDD
              <FaExternalLinkAlt className="h-3 w-3 lg:h-4 lg:w-4 ml-2 text-current" />
            </span>
          </Link>

        </div>




        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black text-white border-t border-gray-800">
          {/* Navigation Links */}
          <div className="flex flex-col space-y-4 px-6 py-6">
            <Link
              to="/"
              className="hover:text-orange-500 transition-colors duration-200 py-2"
            >
              Explore
            </Link>
            <Link
              to="/faucet"
              className="hover:text-orange-500 transition-colors duration-200 py-2"
            >
              Faucet
            </Link>
            <Link
              to="/leaderboard"
              className="hover:text-orange-500 transition-colors duration-200 py-2"
            >
              Leaderboard
            </Link>

            <Link
              to="/stake"
              className="hover:text-orange-500 transition-colors duration-200 py-2"
            >
              Stake
            </Link>
            <Link
              to="https://app.virtuals.io/geneses/1057"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-orange-500 transition-colors duration-200 py-2"
            >
              Buy $SPRDD
              <FaExternalLinkAlt className="h-3 w-3 lg:h-4 lg:w-4 ml-1 text-current group-hover:text-orange-500 transition-colors duration-200" />
            </Link>
          </div>

          {/* Wallet Section */}
          <div className="px-6 py-4 border-t border-zinc-800">
            {authenticated ? (
              <div className="space-y-4">
                {/* Profile Link */}
                <Link
                  to="/user/profile"
                  className="flex items-center gap-2 hover:text-orange-500 transition-colors duration-200 text-base"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="font-medium">My Profile</span>
                </Link>

                {/* Disconnect Wallet Button */}
                <button
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center w-full font-medium text-left text-base text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3 text-orange-500" />
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transform hover:-translate-y-0.5 text-base"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 lg:space-x-6 hidden md:flex">
        {authenticated ? (
          <>
            {/* Profile button triggering the dropdown */}
            <button
              ref={profileButtonRef}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`text-gray-300 p-2 rounded-full transition-all duration-300 transform ${showProfileDropdown
                  ? "bg-orange-500 text-black rotate-[360deg]"
                  : "hover:bg-gray-800 hover:text-white"
                }`}
            >
              <UserRound className="h-6 w-6" />
            </button>

            {/* Enhanced profile dropdown */}
            {showProfileDropdown && (
              <div
                ref={profileDropdownRef}
                className="absolute right-4 mt-2 w-80 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-xl shadow-2xl z-50 top-16 overflow-hidden"
              >
                {/* Profile Header */}
                <div className="px-5 py-4 border-b border-zinc-800/70 bg-gradient-to-r from-orange-500/5 to-transparent">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium text-base">
                        My Profile
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1 flex items-center">
                        <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                        Connected to {networkName}
                      </p>
                    </div>
                    <div className="bg-zinc-800 h-12 w-12 rounded-full flex items-center justify-center text-orange-500">
                      <UserRound size={20} />
                    </div>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="px-5 py-4 border-b border-zinc-800/50">
                  <h4 className="text-sm text-zinc-400 mb-2 flex items-center">
                    <Wallet size={14} className="mr-2 text-orange-500" />
                    Wallet
                  </h4>

                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-white flex items-center">
                      <span>{formatAddress(user?.wallet?.address)}</span>
                      <button
                        onClick={() =>
                          user?.wallet?.address &&
                          copyToClipboard(user.wallet.address)
                        }
                        className="ml-2 text-zinc-400 hover:text-orange-500 transition-colors"
                      >
                        {copySuccess ? (
                          <span className="text-green-500 text-xs">
                            Copied!
                          </span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </p>
                    <Link
                      to={`https://basescan.org/address/${user?.wallet?.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-400 text-xs flex items-center"
                    >
                      View <ExternalLink size={12} className="ml-1" />
                    </Link>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-zinc-400">Balance</p>
                    <p className="text-sm font-medium text-white flex items-center">
                      <FaDollarSign className="h-3 w-3 mr-1 text-orange-500" />
                      {isLoadingBalance ? (
                        <span className="text-zinc-400">Loading...</span>
                      ) : userBalance ? (
                        <span>
                          {parseFloat(
                            formatUnits(BigInt(userBalance?.value), 6)
                          ).toFixed(4)}{" "}
                          USD
                        </span>
                      ) : (
                        <span className="text-zinc-400">--</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="px-2 py-2">
                  <Link
                    to="/user/profile"
                    className="flex items-center px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <FaUser className="h-4 w-4 mr-3 text-orange-500" />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center px-3 py-2 w-full text-left text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-orange-500" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => login()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-semibold px-4 lg:px-6 py-2 lg:py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transform hover:-translate-y-0.5 text-sm lg:text-base"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
