import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";
import {
  FaChevronDown,
  FaExternalLinkAlt,
  FaEthereum,
  FaUser,
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { formatEther } from "viem";
import { UserRound, Wallet, LogOut, Copy, ExternalLink } from "lucide-react";

import { PRIVY_APP_ID } from "../lib/privy";

const Navbar = () => {
  const { login, authenticated, logout, getAccessToken, user, ready } =
    usePrivy();
  const [networkName, setNetworkName] = useState("Base");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

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
    const fetchAccessToken = async () => {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          console.log("Access Token:", token);
        } catch (error) {
          console.error("Error fetching access token:", error);
        }
      }
    };

    fetchAccessToken();
  }, [authenticated, getAccessToken]);

  // Fetch wallet balance using Privy API
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!authenticated || !user || !user.wallet?.address) return;

      try {
        setIsLoadingBalance(true);

        // First get the access token
        const accessToken = await getAccessToken();

        // Determine the wallet ID - this is typically the user's wallet address
        const walletId = user.wallet.address;

        // Make the API request to get the wallet balance
        const response = await fetch(
          `https://api.privy.io/v1/wallets/${walletId}/balance`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "privy-app-id": PRIVY_APP_ID || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch balance: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Format and set the balance
        if (data && data.balance) {
          // The API might return the balance in wei, so we need to format it
          const formattedBalance = Number(
            formatEther(BigInt(data.balance))
          ).toFixed(4);
          setBalance(formattedBalance);
        }

        // If the API provides network info, set it
        if (data && data.network) {
          setNetworkName(data.network);
        } else if (user.wallet.chainType) {
          const chainIdMap: Record<string, string> = {
            "0x1": "Ethereum",
            "0x5": "Goerli",
            "0xaa36a7": "Sepolia",
            "0x89": "Polygon",
            "0x38": "BSC",
            "0xa4b1": "Arbitrum",
            "0xa": "Optimism",
            "0x2105": "Base",
          };

          setNetworkName(
            chainIdMap[user.wallet.chainType] ||
              `Chain ${user.wallet.chainType}`
          );
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (authenticated && ready) {
      fetchWalletBalance();
    }
  }, [authenticated, user, ready, getAccessToken]);

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

  return (
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between px-4 lg:px-8 py-4 bg-black text-white border-b border-gray-800 ">
      {/* <nav className="flex flex-col  md:flex-row md:items-center px-4 lg:px-8 py-4 bg-black text-white border-b border-gray-800"> */}
      <div className="flex justify-between items-center md:contents">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.jpg"
              alt="SPREDD MARKETS Logo"
              className="h-10 w-auto mr-3"
            />

            <span className="text-2xl font-extrabold leading-tight">
              <span className="text-white">SPREDD</span>
              <span className="text-orange-500 ml-1">MARKETS</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-10 lg:space-x-12 text-base font-medium">
          <Link
            to="/trade"
            className="hover:text-orange-500 transition-colors duration-200 py-2"
          >
            Trade
          </Link>

          <div className="relative group">
            <Link
              to="/dao"
              className="flex items-center hover:text-orange-500 transition-colors duration-200 py-2"
            >
              DAO
              <FaChevronDown className="h-4 w-4 ml-1 text-current group-hover:text-orange-500 transition-colors duration-200" />
            </Link>
          </div>

          <Link
            to="/earn"
            className="hover:text-orange-500 transition-colors duration-200 py-2"
          >
            Earn
          </Link>
          <a
            href="https://retroservices1121.gitbook.io/decentralized-forecasting-powered-by-smart-contracts.-predict-rank-and-earn-weekly."
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors duration-200 py-2"
          >
            Whitepaper
          </a>

          <Link
            to="/buy-crypto"
            className="flex items-center hover:text-orange-500 transition-colors duration-200 py-2"
          >
            Buy Crypto
            <FaExternalLinkAlt className="h-4 w-4 ml-1 text-current group-hover:text-orange-500 transition-colors duration-200" />
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
              to="/trade"
              className="block hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trade
            </Link>
            <Link
              to="/dao"
              className="block hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              DAO
            </Link>
            <Link
              to="/earn"
              className="block hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Earn
            </Link>
            <a
              href="https://retroservices1121.gitbook.io/decentralized-forecasting-powered-by-smart-contracts.-predict-rank-and-earn-weekly."
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-orange-500 transition-colors duration-200"
            >
              Whitepaper
            </a>
            <Link
              to="/buy-crypto"
              className="block hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy Crypto
            </Link>
          </div>

          {/* Wallet Section */}
          <div className="px-6 py-4 border-t border-zinc-800">
            {authenticated ? (
              <div className="relative">
                {/* Profile button */}
                <button
                  ref={profileButtonRef}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`text-gray-300 p-2 rounded-full transition-all duration-300 transform ${
                    showProfileDropdown
                      ? "bg-orange-500 text-black rotate-[360deg]"
                      : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <UserRound className="h-6 w-6" />
                </button>

                {/* Dropdown */}
                {showProfileDropdown && (
                  <div
                    ref={profileDropdownRef}
                    className="absolute  w-80 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700/50 rounded-xl shadow-2xl z-50 mt-4"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-800/70 bg-gradient-to-r from-orange-500/5 to-transparent">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-medium">My Profile</h3>
                          <p className="text-sm text-zinc-400 mt-1 flex items-center">
                            <span className="bg-green-500 w-2 h-2 rounded-full mr-2" />
                            Connected to {networkName}
                          </p>
                        </div>
                        <div className="bg-zinc-800 h-12 w-12 rounded-full flex items-center justify-center text-orange-500">
                          <UserRound size={22} />
                        </div>
                      </div>
                    </div>

                    {/* Wallet Info */}
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
                        <a
                          href={`https://basescan.org/address/${user?.wallet?.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:text-orange-400 text-xs flex items-center"
                        >
                          View <ExternalLink size={12} className="ml-1" />
                        </a>
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
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transform hover:-translate-y-0.5"
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
              className={`text-gray-300 p-2 rounded-full transition-all duration-300 transform ${
                showProfileDropdown
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
                      <h3 className="text-white font-medium">My Profile</h3>
                      <p className="text-sm text-zinc-400 mt-1 flex items-center">
                        <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                        Connected to {networkName}
                      </p>
                    </div>
                    <div className="bg-zinc-800 h-12 w-12 rounded-full flex items-center justify-center text-orange-500">
                      <UserRound size={22} />
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
                    <a
                      href={`https://basescan.org/address/${user?.wallet?.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-400 text-xs flex items-center"
                    >
                      View <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-zinc-400">Balance</p>
                    <p className="text-sm font-medium text-white flex items-center">
                      <FaEthereum className="h-3 w-3 mr-1 text-orange-500" />
                      {isLoadingBalance ? (
                        <span className="text-zinc-400">Loading...</span>
                      ) : balance ? (
                        <span>{balance} ETH</span>
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
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transform hover:-translate-y-0.5"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
