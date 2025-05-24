import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
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
        <div className="flex flex-col min-h-screen bg-black ">
          <BrowserRouter>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Explore />} />
                <Route path="/user/profile" element={<UserProfile />} />
                <Route path="/create-prediction" element={<CreatePrediction />} />
                <Route path="/leaderboard" element={<LeaderBoard />} />
                <Route path="/trade" element={<Trade />} />
                <Route path="/trade/:marketId" element={<Trade />} />
                <Route path="/about" element={<div>About</div>} />
                <Route path="/contact" element={<div>Contact</div>} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </div>
      </PrivyProvider>
    </ToastProvider>
  );
}

export default App;