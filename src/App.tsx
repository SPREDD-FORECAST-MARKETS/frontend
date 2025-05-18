import { BrowserRouter,Route,Routes } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import Navbar from "./components/Navbar"

function App() {

  return (
    <>
      <div className="">
        <BrowserRouter>
        <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<div>About</div>} />
            <Route path="/contact" element={<div>Contact</div>} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
