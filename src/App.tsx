import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { privyConfig, PRIVY_APP_ID } from "./lib/privy";
import Explore from "./pages/Explore";
import CreatePrediction from "./pages/CreatePrediction";
import { base } from "viem/chains";
import UserProfile from "./pages/UserProfile";
import Trade from "./pages/Trade";
import LeaderBoard from "./pages/LeaderBoard";
import { ToastProvider } from "./components/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig } from "./utils/wagmiConfig";
import Faucet from "./pages/Faucet";
import LogOut from "./pages/Logout"; // Use LoginPage instead of LogOut
import { useEffect, type JSX } from "react";
import PrivacyPage from "./pages/PrivacyPage";
import TermsConditions from "./pages/TermsConditions";
import Waitlist from "./pages/Waitlist";
import ScrollToTop from "./utils/scrolltop";
import { MiniAppProvider } from '@neynar/react';
import { sdk } from '@farcaster/miniapp-sdk';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authenticated, ready } = usePrivy();

  // Show loading while checking auth status
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-white/5 via-transparent to-black/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page with navigation
  if (!authenticated) {
    return (
      <>
        <Navbar />
        <LogOut />
        <Footer />
      </>
    );
  }

  // If authenticated, render the protected content
  return children;
};

function AppContent() {
  useEffect(() => {
    const initialize = async () => {
      await sdk.actions.ready();
    };
    initialize();
  }, []);

  return (
<div className="flex flex-col min-h-screen bg-black">


      <BrowserRouter>
        <ScrollToTop />

        <main className="flex-grow pt-[63px]">
          <Routes>
            {/* Public route - Explore page accessible to everyone */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Explore />
                  <Footer />
                </>
              }
            />
            {/* Public route - Explore page accessible to everyone */}
            <Route
              path="/privacy-policy"
              element={
                <>
                  <Navbar />
                  <PrivacyPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/terms-conditions"
              element={
                <>
                  <Navbar />
                  <TermsConditions />
                  <Footer />
                </>
              }
            />
            {/* Protected routes */}
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <UserProfile />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-prediction"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <CreatePrediction />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <LeaderBoard />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade"
              element={
                <>
                  <Navbar />
                  <Trade />
                  <Footer />
                </>
              }
            />
            <Route
              path="/trade/:marketId"
              element={
                <>
                  <Navbar />
                  <Trade />
                  <Footer />
                </>
              }
            />
            <Route
              path="/faucet"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Faucet />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            {/* Public routes */}
            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <div className="text-white p-8">About Page</div>
                  <Footer />
                </>
              }
            />
            <Route
              path="/contact"
              element={
                <>
                  <Navbar />
                  <div className="text-white p-8">Contact Page</div>
                  <Footer />
                </>
              }
            />
            <Route
              path="/creators"
              element={
                <>
                  <Navbar />
                  <Waitlist />
                </>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>

    </div>
  );
}

function App() {
  if (!PRIVY_APP_ID) {
    console.error(
      "Privy App ID is not defined. Please set the VITE_PRIVY_APP_ID environment variable."
    );
  }

  return (
    <ToastProvider>
      <PrivyProvider
        appId={PRIVY_APP_ID || "fallback-app-id"}
        config={{
          ...privyConfig,
          defaultChain: base,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
          <MiniAppProvider analyticsEnabled={true}>
            <AppContent />
            </MiniAppProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </ToastProvider>
  );
}

export default App;
