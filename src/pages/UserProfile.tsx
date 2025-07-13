import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Edit3,
  Copy,
  CheckCircle,
  Activity,
  Calendar,
  Clock,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/user";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import EditProfileModal from "./EditProfile";
import { fetchTradesByUser, handleTradeError } from "../apis/trade"; // Import trade API
import type { TradeEntry } from "../apis/trade";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";
import { FP_MANAGER_ABI } from "../abi/FPManager";
import { fetchUserDashboardInfo, type UserDashboardInfo } from "../apis/user";
import { fetchUserMarkets, type UserMarket } from "../apis/market"; // Import user markets API

const UserProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData] = useAtom(userAtom);
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState("transactions");
  const [copied, setCopied] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllCreated, setShowAllCreated] = useState(false);

  // Transaction state
  const [transactions, setTransactions] = useState<TradeEntry[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);

  // Markets state
  const [userMarkets, setUserMarkets] = useState<UserMarket[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [marketsPage, setMarketsPage] = useState(1);
  const [hasMoreMarkets, setHasMoreMarkets] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [userPridictionData, setUserPredictionData] =
    useState<UserDashboardInfo | null>(null);

  // Refs for infinite scroll
  const transactionScrollRef = useRef<HTMLDivElement>(null);
  const marketsScrollRef = useRef<HTMLDivElement>(null);

  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const getWalletAddress = async () => {
      const walletAddress = wallets[0]?.address;
      setConnectedWallet(walletAddress);
      return walletAddress;
    };

    return () => {
      getWalletAddress();
    };
  }, [wallets]);

  const { data: userFPData } = useReadContract({
    address: CONTRACT_ADDRESSES.fpManager,
    abi: FP_MANAGER_ABI,
    functionName: "getCurrentWeekUserFP",
    args: [connectedWallet],
  }) as any;

  // Fetch user transactions
  const fetchUserTransactions = async (
    page: number = 1,
    reset: boolean = false
  ) => {
    if (!wallets[0]?.address) return;

    setTransactionLoading(true);
    setTransactionError(null);

    try {
      const [data, status] = await fetchTradesByUser(wallets[0].address, {
        page,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (status === 200 && data) {
        if (reset) {
          setTransactions(data.data);
        } else {
          setTransactions((prev) => [...prev, ...data.data]);
        }
        setHasMoreTransactions(data.pagination.hasNext);
        setTransactionPage(page);
      } else {
        throw new Error("Failed to fetch transactions");
      }
    } catch (error: any) {
      const errorMessage = handleTradeError(error, "fetchUserTransactions");
      setTransactionError(errorMessage);
      console.error("Error fetching user transactions:", error);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Fetch user markets
  const fetchUserCreatedMarkets = async (
    page: number = 1,
    reset: boolean = false
  ) => {
    if (!wallets[0]?.address) return;

    setMarketsLoading(true);
    setMarketsError(null);

    try {
      const [data, status] = await fetchUserMarkets(wallets[0].address, {
        page,
        limit: 10,
      });

      if (status === 200 && data) {
        if (reset) {
          setUserMarkets(data);
        } else {
          setUserMarkets((prev) => [...prev, ...data]);
        }
        // Estimate if there are more markets (since backend doesn't provide total count)
        setHasMoreMarkets(data.length === 10);
        setMarketsPage(page);
      } else {
        throw new Error("Failed to fetch markets");
      }
    } catch (error: any) {
      setMarketsError("Failed to fetch markets");
      console.error("Error fetching user markets:", error);
    } finally {
      setMarketsLoading(false);
    }
  };

  // Load more transactions
  const loadMoreTransactions = useCallback(() => {
    if (!transactionLoading && hasMoreTransactions) {
      fetchUserTransactions(transactionPage + 1, false);
    }
  }, [transactionLoading, hasMoreTransactions, transactionPage]);

  // Load more markets
  const loadMoreMarkets = useCallback(() => {
    if (!marketsLoading && hasMoreMarkets) {
      fetchUserCreatedMarkets(marketsPage + 1, false);
    }
  }, [marketsLoading, hasMoreMarkets, marketsPage]);

  // Infinite scroll handler
  const handleScroll = useCallback(
    (
      scrollRef: React.RefObject<HTMLDivElement | null>,
      loadMore: () => void
    ) => {
      const element = scrollRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const threshold = 100; // Load more when 100px from bottom

      if (scrollHeight - (scrollTop + clientHeight) < threshold) {
        loadMore();
      }
    },
    []
  );

  // Set up scroll listeners
  useEffect(() => {
    const transactionElement = transactionScrollRef.current;
    const marketsElement = marketsScrollRef.current;

    const handleTransactionScroll = () =>
      handleScroll(transactionScrollRef, loadMoreTransactions);
    const handleMarketsScroll = () =>
      handleScroll(marketsScrollRef, loadMoreMarkets);

    if (showAllTransactions && transactionElement) {
      transactionElement.addEventListener("scroll", handleTransactionScroll);
    }

    if (showAllCreated && marketsElement) {
      marketsElement.addEventListener("scroll", handleMarketsScroll);
    }

    return () => {
      if (transactionElement) {
        transactionElement.removeEventListener(
          "scroll",
          handleTransactionScroll
        );
      }
      if (marketsElement) {
        marketsElement.removeEventListener("scroll", handleMarketsScroll);
      }
    };
  }, [
    showAllTransactions,
    showAllCreated,
    handleScroll,
    loadMoreTransactions,
    loadMoreMarkets,
  ]);

  // Initial load of transactions
  useEffect(() => {
    if (wallets[0]?.address && activeTab === "transactions") {
      fetchUserTransactions(1, true);
    }
  }, [wallets[0]?.address, activeTab]);

  // Initial load of markets
  useEffect(() => {
    if (wallets[0]?.address && activeTab === "created") {
      fetchUserCreatedMarkets(1, true);
    }
  }, [wallets[0]?.address, activeTab]);

  // Format transaction type for display
  const formatTransactionType = (orderType: string) => {
    return orderType.toLowerCase();
  };

  // Format transaction status
  const formatTransactionStatus = () => {
    return "completed";
  };

  // Format transaction amount with order type
  const formatTransactionAmount = (amount: string, orderType: string) => {
    const prefix = orderType === "BUY" ? "-" : "+";
    return `${prefix}$${parseFloat(amount).toFixed(2)}`;
  };

  // Format market status
  const formatMarketStatus = (status: string, expiry_date: string) => {
    const isExpired = new Date(expiry_date) < new Date();

    if (status === "CLOSED") return "Closed";
    if (status === "EXPIRED" || isExpired) return "Expired";
    if (status === "ACTIVE") return "Active";

    return status;
  };

  // Get status color
  const getStatusColor = (status: string, expiry_date: string) => {
    const isExpired = new Date(expiry_date) < new Date();

    if (status === "CLOSED") return "text-blue-400";
    if (status === "EXPIRED" || isExpired) return "text-red-400";
    if (status === "ACTIVE") return "text-green-400";

    return "text-gray-400";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return "No wallet connected";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getUserPredictionData = async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    const data = await fetchUserDashboardInfo(accessToken!);
    setUserPredictionData(data[0]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getUserPredictionData();
    }, 15000);

    getUserPredictionData();

    return () => clearInterval(interval);
  }, []);

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
                    {formatWalletAddress(wallets[0]?.address)}
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
                  <Link
                    to={`https://etherscan.io/address/${wallets[0]?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </Link>
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
              {userPridictionData?.predictions || 0}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">
              Predictions
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              {userPridictionData?.wins || 0}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">Wins</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              {userFPData?.[1]?.toString() || 0}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">Creator FP</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300 cursor-pointer group">
            <span className="text-orange-500 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
              {userFPData?.[0]?.toString() || 0}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm">Trader FP</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex overflow-x-auto bg-zinc-900/30">
          <button
            onClick={() => {
              setActiveTab("transactions");
              setShowAllTransactions(false);
            }}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === "transactions"
              ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80"
              : "text-gray-400 hover:text-white hover:bg-zinc-900/50"
              }`}
          >
            <Activity size={14} className="hidden sm:inline" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("created");
              setShowAllCreated(false);
            }}
            className={`px-3 py-3 sm:px-6 sm:py-4 flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === "created"
              ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900/80"
              : "text-gray-400 hover:text-white hover:bg-zinc-900/50"
              }`}
          >
            <Clock size={14} className="hidden sm:inline" />
            <span>Created</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-black to-zinc-900/30">
          {activeTab === "transactions" && (
            <div>
              <div className="grid grid-cols-12 gap-2 sm:gap-4 pb-3 mb-2 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm">
                <div className="col-span-5 md:col-span-4">Transaction</div>
                <div className="col-span-3 md:col-span-4 text-center hidden sm:block">
                  Date
                </div>
                <div className="col-span-6 sm:col-span-3 text-right">
                  Amount
                </div>
              </div>

              {/* Loading state */}
              {transactionLoading && transactions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  Loading transactions...
                </div>
              )}

              {/* Error state */}
              {transactionError && (
                <div className="text-center py-8 text-red-400">
                  <p>{transactionError}</p>
                  <button
                    onClick={() => fetchUserTransactions(1, true)}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Transactions list with scroll */}
              <div
                ref={transactionScrollRef}
                className={`${showAllTransactions ? "max-h-96 overflow-y-auto" : ""
                  } space-y-2`}
              >
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="grid grid-cols-12 gap-2 sm:gap-4 py-3 sm:py-4 border-b border-zinc-800/50 items-center hover:bg-zinc-900/30 rounded-lg transition-all duration-300 px-2 group"
                  >
                    <div className="col-span-5 md:col-span-4">
                      <div className="font-medium text-white text-sm sm:text-base">
                        {tx.market?.question || `Transaction #${tx.id}`}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {formatTransactionType(tx.order_type)} •{" "}
                        {formatTransactionStatus()}
                        <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      </div>
                      <div className="text-xs text-gray-400 sm:hidden mt-1">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-4 text-center text-gray-400 hidden sm:block">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-6 sm:col-span-3 text-right font-medium group-hover:text-orange-500 transition-colors">
                      {formatTransactionAmount(tx.amount, tx.order_type)}
                    </div>
                  </div>
                ))}

                {/* Loading more indicator */}
                {showAllTransactions && transactionLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                )}
              </div>

              {/* No transactions */}
              {!transactionLoading &&
                !transactionError &&
                transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Activity
                      size={40}
                      className="mx-auto mb-4 text-orange-500 opacity-30"
                    />
                    <p>No transactions found</p>
                  </div>
                )}

              {/* View All button */}
              {!showAllTransactions && transactions.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllTransactions(true)}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300"
                  >
                    View All Transactions
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "created" && (
            <div>
              {/* Loading state */}
              {marketsLoading && userMarkets.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  Loading markets...
                </div>
              )}

              {/* Error state */}
              {marketsError && (
                <div className="text-center py-8 text-red-400">
                  <p>{marketsError}</p>
                  <button
                    onClick={() => fetchUserCreatedMarkets(1, true)}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {userMarkets.length > 0 ? (
                <div>
                  <div className="mb-4 sm:mb-6 pb-3 border-b border-zinc-800 text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <h3 className="text-white text-base sm:text-lg font-medium">
                      My Created Markets
                    </h3>
                    <button className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-xs sm:text-sm hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300">
                      <Link to="/create-prediction">Create New Market</Link>
                    </button>
                  </div>

                  {/* Markets list with scroll */}
                  <div
                    ref={marketsScrollRef}
                    className={`${showAllCreated ? "max-h-96 overflow-y-auto" : ""
                      } grid grid-cols-1 gap-4 sm:gap-6`}
                  >
                    {userMarkets.map((market) => (
                      <div
                        key={market.id}
                        className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-500/30 group"
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500/20 to-black flex-shrink-0 border border-zinc-800 group-hover:border-orange-500/30 transition-all duration-300">
                            <img
                              src={market.image || "/api/placeholder/56/56"}
                              alt={market.question}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300"
                            />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2 group-hover:text-orange-500 transition-colors">
                              {market.question}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                              {market.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Clock size={12} className="text-orange-500" />
                                <span>
                                  Created:{" "}
                                  {new Date(
                                    market.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Calendar
                                  size={12}
                                  className="text-orange-500"
                                />
                                <span>
                                  Expires:{" "}
                                  {new Date(
                                    market.expiry_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-3 sm:gap-3 items-center sm:items-end w-full sm:w-auto mt-3 sm:mt-0 justify-between">
                            <span
                              className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(
                                market.status,
                                market.expiry_date
                              )}`}
                            >
                              {formatMarketStatus(
                                market.status,
                                market.expiry_date
                              )}
                            </span>
                            <button className="text-xs bg-zinc-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-800 transition-all duration-300">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loading more indicator */}
                    {showAllCreated && marketsLoading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                      </div>
                    )}
                  </div>

                  {/* View All button */}
                  {!showAllCreated && userMarkets.length > 0 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllCreated(true)}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg text-xs sm:text-sm text-white border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all duration-300"
                      >
                        View All Markets
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !marketsLoading &&
                !marketsError && (
                  <div className="text-center py-8 sm:py-10 text-gray-400">
                    <div className="mb-4">
                      <Clock
                        size={40}
                        className="mx-auto text-orange-500 opacity-30"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg text-white mb-2">
                      No Markets Created Yet
                    </h3>
                    <p className="text-sm">
                      Create your first prediction market to see it listed here.
                    </p>
                    <button className="mt-4 px-5 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white hover:from-orange-600 hover:to-orange-700 transition-colors transform hover:scale-105 duration-300 text-sm">
                      <Link to="/create-prediction">Create Market</Link>
                    </button>
                  </div>
                )
              )}
            </div>
          )}
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
                <Link to={"/privacy-policy"}>
                  Privacy
                </Link>
              </button>
               <button className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1">
                <Link to={"/terms-conditions"}>
                   Terms
                </Link>
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
