import { BrowserRouter,Route,Routes } from "react-router-dom"
import LandingPage from "./pages/LandingPage"

function App() {

  return (
    <>
      <div className="">
        <BrowserRouter>
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
