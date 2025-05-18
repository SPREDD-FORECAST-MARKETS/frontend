// src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { PrivyProvider } from '@privy-io/react-auth'
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { privyConfig, PRIVY_APP_ID } from "./lib/privy"
import Explore from "./pages/Explore"

function App() {
  if (!PRIVY_APP_ID) {
    console.error('Privy App ID is not defined. Please set the VITE_PRIVY_APP_ID environment variable.');  }
  
  return (
    <PrivyProvider 
      appId={PRIVY_APP_ID || 'fallback-app-id'}
      config={privyConfig}
    >
      <div className="flex flex-col min-h-screen bg-black ">
        <BrowserRouter>
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Explore />} />
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