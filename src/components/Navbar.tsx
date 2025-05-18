import { usePrivy } from '@privy-io/react-auth';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaExternalLinkAlt, FaEthereum, FaCog } from 'react-icons/fa'; 

const Navbar = () => {
  const { login, authenticated, logout } = usePrivy();

  return (
    <nav className="flex items-center justify-between px-4 lg:px-8 py-4 bg-black text-white border-b border-gray-800">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.jpg" alt="SPREDD MARKETS Logo" className="h-10 w-auto mr-3" /> 

          <span className="text-2xl font-extrabold leading-tight">
            <span className="text-white">SPREDD</span>
            <span className="text-orange-500 ml-1">MARKETS</span>
          </span>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-10 lg:space-x-12 text-base font-medium"> 

        <Link to="/trade" className="hover:text-orange-500 transition-colors duration-200 py-2">Trade</Link>

        <div className="relative group">
\          <Link to="/dao" className="flex items-center hover:text-orange-500 transition-colors duration-200 py-2">
            DAO
\             <FaChevronDown className="h-4 w-4 ml-1 text-current group-hover:text-orange-500 transition-colors duration-200" /> 
          </Link>
        </div>

        <Link to="/earn" className="hover:text-orange-500 transition-colors duration-200 py-2">Earn</Link>
        <Link to="/bridges" className="hover:text-orange-500 transition-colors duration-200 py-2">Bridges</Link>

        <Link to="/buy-crypto" className="flex items-center hover:text-orange-500 transition-colors duration-200 py-2">
          Buy Crypto
           <FaExternalLinkAlt className="h-4 w-4 ml-1 text-current group-hover:text-orange-500 transition-colors duration-200" /> 
        </Link>
      </div>

      <div className="flex items-center space-x-4 lg:space-x-6"> 
        <div className="flex items-center bg-gray-700 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-600 transition-colors duration-200"> 
          <FaEthereum className="h-4 w-4 mr-2 text-orange-500" /> 
          <span className="text-gray-300">Ethereum</span> 
        </div>

        {authenticated ? (
          <button
            onClick={() => logout()}
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2.5 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50" 
          >
            Disconnect
</button>
        ) : (
          <button
            onClick={() => login()}
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2.5 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50" 
          >
            Connect Wallet
          </button>
        )}

        <button className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"> 
           <FaCog className="h-6 w-6 text-current" /> {/* Icon size */}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;