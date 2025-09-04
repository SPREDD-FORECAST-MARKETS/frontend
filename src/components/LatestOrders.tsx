import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Clock, User, DollarSign } from "lucide-react";
import { fetchLatestTrades, type Order } from "../apis/trade";



interface LatestOrdersProps {
    marketId: string;
}

const LatestOrders: React.FC<LatestOrdersProps> = ({ marketId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLatestOrders = useCallback(async (showLoader: boolean = true): Promise<void> => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            setError(null);

            // Real API endpoint
            const [data, ] = await fetchLatestTrades(marketId)
            setOrders(data!);

            if (showLoader) {
                setLoading(false);
            }

        } catch (err: unknown) {
            console.error("Error fetching latest orders:", err);
            setError(err instanceof Error ? err.message : "Failed to load orders");
            if (showLoader) {
                setLoading(false);
            }
        }
    }, [marketId]);

    useEffect(() => {
        // Initial load with loader
        fetchLatestOrders(true);

        // Set up auto-refresh every 15 seconds (silent refresh)
        const refreshInterval = setInterval(() => {
            fetchLatestOrders(false);
        }, 15000);

        // Cleanup interval on unmount
        return () => {
            clearInterval(refreshInterval);
        };
    }, [fetchLatestOrders]);

    const formatTimeAgo = (timestamp: string): string => {
        const now = new Date();
        const orderTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - orderTime.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        }
    };

    const formatAmount = (amount: number): string => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        }
        return `$${amount.toFixed(2)}`;
    };

    const getOrderIcon = (type: string, outcome: string) => {
        if (type === "BUY" && outcome === "YES") {
            return <TrendingUp size={14} className="text-green-400" />;
        } else if (type === "BUY" && outcome === "NO") {
            return <TrendingDown size={14} className="text-red-400" />;
        } else if (type === "SELL" && outcome === "YES") {
            return <TrendingDown size={14} className="text-red-400" />;
        } else {
            return <TrendingUp size={14} className="text-green-400" />;
        }
    };

    const getOrderColor = (type: string, outcome: string): string => {
        if (type === "BUY" && outcome === "YES") {
            return "border-green-500/20 bg-green-500/5";
        } else if (type === "BUY" && outcome === "NO") {
            return "border-red-500/20 bg-red-500/5";
        } else if (type === "SELL" && outcome === "YES") {
            return "border-red-500/20 bg-red-500/5";
        } else {
            return "border-green-500/20 bg-green-500/5";
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={18} />
                    Latest Orders
                </h3>
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className="bg-white/5 rounded-lg p-3 animate-pulse"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-white/10 rounded-full"></div>
                                    <div className="w-20 h-4 bg-white/10 rounded"></div>
                                </div>
                                <div className="w-16 h-4 bg-white/10 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={18} />
                    Latest Orders
                </h3>
                <div className="text-center py-8">
                    <p className="text-red-400 mb-2">Failed to load orders</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                    <button
                        onClick={() => fetchLatestOrders(true)}
                        className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={18} />
                    Latest Orders
                </h3>
                <button
                    onClick={() => fetchLatestOrders(true)}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                    Refresh
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <Clock size={32} className="mx-auto text-slate-500 mb-3" />
                    <p className="text-slate-400">No orders yet</p>
                    <p className="text-slate-500 text-sm">Be the first to trade on this market!</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={`border rounded-lg p-3 transition-all hover:bg-white/5 ${getOrderColor(
                                order.type,
                                order.outcome
                            )}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getOrderIcon(order.type, order.outcome)}
                                    <span className="text-white font-medium text-sm">
                                        {order.type} {order.outcome}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.outcome === "YES"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {order.outcome}
                                    </span>
                                </div>
                                <div className="text-slate-400 text-xs flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTimeAgo(order.timestamp)}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-slate-300">
                                        <User size={12} />
                                        <span className="font-medium">{order.username}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-300">
                                        <DollarSign size={12} />
                                        <span>{formatAmount(order.amount)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">
                                        {Math.round(order.price * 100)}%
                                    </div>
                                    <div className="text-slate-400 text-xs">
                                        {order.shares.toFixed(0)} shares
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {orders.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-slate-500 text-xs text-center">
                        Showing latest {orders.length} order{orders.length !== 1 ? 's' : ''}
                        {orders.length === 10 && ' (max 10)'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LatestOrders;