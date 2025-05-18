// src/components/Footer.tsx
import { Link } from 'react-router-dom';

import { FaTwitter, FaDiscord, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (

    <footer className="bg-black text-white py-20 px-6 lg:px-16">
      <div className="container mx-auto max-w-screen-xl">


        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 mb-16 border-b border-gray-800 pb-12">


          <div className="col-span-1 md:col-span-1 pr-0 md:pr-8 lg:pr-16"> 
            <div className="flex items-start space-x-4 mb-6"> 

              <img
                src="/logo.jpg" 
                alt="SPREDD MARKETS Logo"
                className="h-14 w-auto mt-0.5" 
              />
              <div className="flex flex-col leading-tight">
                 <div className="font-extrabold text-3xl">
                    <span className="text-white">SPREDD</span>
                    <span className="text-orange-500 ml-1">MARKETS</span>
                 </div>

                 <div className="text-sm text-gray-500 font-medium tracking-wide mt-1">The Future of Prediction Is Skill, Not Luck</div>
              </div>
            </div>


            <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
              Decentralized forecasting powered by smart contracts. Predict, rank, and earn weekly. Our system evaluates users based on accuracy, timing, and contrarian insight—rewarding forecasters who consistently demonstrate expertise.
            </p>

          </div>

          <div className="col-span-1 md:col-span-1">

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8"> 
                 <div className="flex flex-col space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8"> 
                     {/* Platform Links */}
                     <div className="flex flex-col space-y-3">
                        <div className="font-semibold text-white text-lg mb-4">Platform</div>
                        <Link to="/predict" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">Predict</Link>
                        <Link to="/rank" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">Ranking</Link>
                        <Link to="/earn" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">Earn Rewards</Link>
                        <Link to="/how-it-works" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">How it Works</Link>
                     </div>

                     {/* Company/Resources Links */}
                      <div className="flex flex-col space-y-3">
                         <div className="font-semibold text-white text-lg mb-4">Company</div>
                         <Link to="/about" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">About Us</Link>
                         <Link to="/contact" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">Contact</Link>
                         <Link to="/whitepaper" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">Whitepaper</Link>
                         <Link to="/tokenomics" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 ease-in-out text-sm">Tokenomics</Link>
                      </div>
                 </div>

                 <div className="flex flex-col items-start md:mt-0 mt-8"> 
                    <div className="font-semibold text-white text-lg mb-4">Connect</div>

                    <div className="flex space-x-4">

                      <a href="https://linkedin.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out">
                         <FaLinkedinIn className="w-5 h-5" />
                      </a>
                      <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out">
                         <FaTwitter className="w-5 h-5" />
                      </a>
                      <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-300 ease-in-out">
                         <FaDiscord className="w-5 h-5" />
                      </a>
                    </div>
                 </div>

             </div>
          </div>

        </div>


        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            &copy; {new Date().getFullYear()} SPREDD MARKETS. All Rights Reserved.
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/privacy-policy" className="hover:text-orange-500 transition-colors duration-300 ease-in-out text-gray-500">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-orange-500 transition-colors duration-300 ease-in-out text-gray-500">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;