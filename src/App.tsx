// src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { PrivyProvider } from '@privy-io/react-auth'
import LandingPage from "./pages/LandingPage"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { privyConfig, PRIVY_APP_ID } from "./lib/privy"

function App() {
  if (!PRIVY_APP_ID) {
    console.error('Privy App ID is not defined. Please set the VITE_PRIVY_APP_ID environment variable.');  }
  
  return (
    <PrivyProvider 
      appId={PRIVY_APP_ID || 'fallback-app-id'}
      config={privyConfig}
    >
      <div className="flex flex-col min-h-screen">
        <BrowserRouter>
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<div>About</div>} />
              <Route path="/contact" element={<div>Contact</div>} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </div>
    </PrivyProvider>
  )
}

export default App