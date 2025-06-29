import { Link } from "react-router-dom";
import { FaTwitter, FaDiscord, FaInstagram, FaTelegram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* <div className="container mx-auto max-w-screen-xl"> */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-8 md:mb-12 border-b border-gray-800 pb-8 md:pb-10">
          {/* Logo and Description Section */}
          <div className="col-span-1 pr-0 md:pr-8">
            <div className="flex items-start space-x-3 mb-4">
              <img
                src="/logo.jpg"
                alt="SPREDD MARKETS Logo"
                className="h-10 md:h-12 w-auto mt-0.5"
              />
              <div className="flex flex-col leading-tight">
                <div className="font-extrabold text-xl md:text-2xl lg:text-3xl">
                  <span className="text-white">SPREDD</span>
                  <span className="text-orange-500 ml-1">MARKETS</span>
                </div>
                <div className="text-xs md:text-sm text-gray-500 font-medium tracking-wide mt-1">
                  The Future of Prediction Is Skill, Not Luck
                </div>
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
              Decentralized forecasting powered by smart contracts. Predict,
              rank, and earn weekly. Our system evaluates users based on
              accuracy, timing, and contrarian insight—rewarding forecasters who
              consistently demonstrate expertise.
            </p>
          </div>

          {/* Navigation Links Section */}
          <div className="col-span-1 mt-6 md:mt-0">
            <div className="w-full flex justify-between">
              {/* Platform Links */}

              <div className="flex flex-col space-y-4">
                <div className="font-semibold text-white text-base md:text-lg mb-2">
                  Quick Links
                </div>
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/leaderboard"
                    className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm md:text-base flex items-center group"
                  >
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Leaderboard
                  </Link>
                  <a
                    href="https://typhoon-pond-4cf.notion.site/Spredd-Markets-Decentralized-Forecasting-Platform-21e6074dcacb800eb3c6ea8007309325?source=copy_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm md:text-base flex items-center group"
                  >
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Whitepaper
                  </a>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm md:text-base flex items-center group"
                  >
                    <span className="mr-2 text-orange-500 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Contact
                  </Link>
                </div>
              </div>

              {/* Connect Section */}
              <div className="flex flex-col col-span-2 lg:col-span-1 mt-6 lg:mt-0">
                <div className="font-semibold text-white text-base md:text-lg mb-2 md:mb-3">
                  Connect
                </div>
                <div className="flex space-x-4">
                  <a
                    href="https://t.me/spreddguard"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="telegram"
                    className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaTelegram className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/spredd.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaInstagram className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                  <a
                    href="https://x.com/spreddai"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaTwitter className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                  <a
                    href="https://discord.com/invite/spredd"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out"
                  >
                    <FaDiscord className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm md:text-base text-gray-500">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            &copy; {new Date().getFullYear()} SPREDD MARKETS. All Rights
            Reserved.
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link
              to="/privacy-policy"
              className="hover:text-orange-500 transition-colors duration-300 ease-in-out text-gray-500 text-sm md:text-base"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-conditions"
              className="hover:text-orange-500 transition-colors duration-300 ease-in-out text-gray-500 text-sm md:text-base"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
