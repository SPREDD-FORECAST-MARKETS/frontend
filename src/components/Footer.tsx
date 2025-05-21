import { Link } from 'react-router-dom';
import { FaTwitter, FaDiscord, FaInstagram, FaTelegram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-16">
      <div className="container mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-12 md:mb-16 border-b border-gray-800 pb-8 sm:pb-10 md:pb-12">
          {/* Logo and Description Section */}
          <div className="col-span-1 md:col-span-1 pr-0 md:pr-8 lg:pr-16"> 
            <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6"> 
              <img
                src="/logo.jpg" 
                alt="SPREDD MARKETS Logo"
                className="h-10 sm:h-12 md:h-14 w-auto mt-0.5" 
              />
              <div className="flex flex-col leading-tight">
                <div className="font-extrabold text-xl sm:text-2xl md:text-3xl">
                  <span className="text-white">SPREDD</span>
                  <span className="text-orange-500 ml-1">MARKETS</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide mt-1">
                  The Future of Prediction Is Skill, Not Luck
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-lg">
              Decentralized forecasting powered by smart contracts. Predict, rank, and earn weekly. Our system evaluates users based on accuracy, timing, and contrarian insight—rewarding forecasters who consistently demonstrate expertise.
            </p>
          </div>

          {/* Navigation Links Section */}
          <div className="col-span-1 md:col-span-1 mt-6 md:mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8"> 
              {/* Platform Links */}
              <div className="flex flex-col space-y-2 sm:space-y-3">
                <div className="font-semibold text-white text-base sm:text-lg mb-2 sm:mb-4">Platform</div>
                <Link to="/predict" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">Predict</Link>
                <Link to="/rank" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">Ranking</Link>
                <Link to="/earn" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">Earn Rewards</Link>
                <Link to="/how-it-works" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">How it Works</Link>
              </div>

              {/* Company Links */}
              <div className="flex flex-col space-y-2 sm:space-y-3">
                <div className="font-semibold text-white text-base sm:text-lg mb-2 sm:mb-4">Company</div>
                <Link to="/about" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">About Us</Link>
                <Link to="/contact" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">Contact</Link>
                <Link to="/whitepaper" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">Whitepaper</Link>
                <Link to="/tokenomics" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-xs sm:text-sm">Tokenomics</Link>
              </div>

              {/* Connect Section */}
              <div className="flex flex-col col-span-2 sm:col-span-1 mt-6 sm:mt-0"> 
                <div className="font-semibold text-white text-base sm:text-lg mb-2 sm:mb-4">Connect</div>
                <div className="flex space-x-3 sm:space-x-4">
                  <a 
                    href="https://t.me/spreddguard" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="telegram" 
                    className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaTelegram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a 
                    href="https://www.instagram.com/spredd.ai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Instagram" 
                    className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a 
                    href="https://x.com/spreddai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Twitter" 
                    className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a 
                    href="https://discord.com/invite/spredd" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Discord" 
                    className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-500">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            &copy; {new Date().getFullYear()} SPREDD MARKETS. All Rights Reserved.
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link to="/privacy-policy" className="hover:text-orange-500 transition-colors duration-300 ease-in-out text-gray-500">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-orange-500 transition-colors duration-300 ease-in-out text-gray-500">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;