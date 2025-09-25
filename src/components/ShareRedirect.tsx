import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ShareRedirect = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the actual trade page
    if (marketId) {
      navigate(`/trade/${marketId}`, { replace: true });
    } else {
      // Fallback to main page if no marketId
      navigate('/', { replace: true });
    }
  }, [marketId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white/5 via-transparent to-black/20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-xl">Redirecting to market...</div>
        <div className="text-gray-400 text-sm mt-2">
          If you're not redirected automatically, <a href={`/trade/${marketId}`} className="text-orange-500 hover:text-orange-400">click here</a>
        </div>
      </div>
    </div>
  );
};

export default ShareRedirect;