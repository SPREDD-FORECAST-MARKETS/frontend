import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import Aurora from '../components/Aurora';
import { TwitterApiService } from '../services/twitterApi';

const WaitlistUser = ({ avatar, name, handle, position }: { avatar: string; name: string; handle: string; position: number }) => (
  <div className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-orange-600/40">
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
      <div>
        <div className="text-white font-medium">{name}</div>
        <div className="text-gray-400 text-sm">{handle}</div>
      </div>
    </div>
    <div className="text-gray-400 font-semibold">#{position}</div>
  </div>
);

const Waitlist = () => {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userList, setUserList] = useState<Array<{avatar: string; name: string; handle: string; position: number}>>([]);
  const [currentUser, setCurrentUser] = useState<{avatar: string; name: string; handle: string} | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const twitterService = new TwitterApiService();
  const { success } = useToast();

  // Use the share page which contains Open Graph tags to ensure a social preview/image is attached.
  const shareUrl = 'https://spredd.markets/creators';

  const handleShareX = () => {
  // New creator program share text





  // Concise creator-focused tweet copy. The share page provides the OG image.
  const text = `Creators — Build markets, engage with your community and hold $SPRDD to boost your rewards. Join the creator's program: ${shareUrl}

#SpreddTheWord #SpreddMarkets`;
  const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;

    // open centered popup
    const w = 700;
    const h = 500;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
  window.open(intentUrl, 'shareToX', `width=${w},height=${h},left=${left},top=${top},resizable=yes`);
  success('Opening X compose');
  };

  // install flow removed — not used when directing straight to X

  useEffect(() => {
    const saved = localStorage.getItem('spredd-creators');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalUsers(data.totalUsers || 0);
      setUserList(data.userList || []);
    }
  }, []);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsValidating(true);
    setValidationError('');

    try {
      const result = await twitterService.validateUsername(username);
      if (result.isValid && result.user) {
        // Prevent duplicates: check if this username already joined (compare case-insensitive)
        const returnedUsername = (result.user.username || '').toString().toLowerCase();
        const alreadyJoined = userList.some(u => (u.handle || '').replace(/^@/, '').toLowerCase() === returnedUsername);
        if (alreadyJoined) {
          setValidationError("This username has already joined the creator's program");
          setIsValidating(false);
          return;
        }

        const newPosition = totalUsers + 1;
        const newUser = {
          avatar: result.user.profile_image_url,
          name: result.user.name,
          handle: `@${result.user.username}`,
          position: newPosition
        };

        const updatedUserList = [newUser, ...userList];
        setPosition(newPosition);
        setTotalUsers(newPosition);
        setUserList(updatedUserList);
        setIsJoined(true);
        setCurrentUser({ avatar: newUser.avatar, name: newUser.name, handle: newUser.handle });

        localStorage.setItem('spredd-creators', JSON.stringify({
          totalUsers: newPosition,
          userList: updatedUserList
        }));
      } else {
        setValidationError(result.error || 'Username not found');
      }
    } catch (err) {
      console.error(err);
      setValidationError('Failed to validate username. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative overflow-visible">
      <div className="absolute inset-0">
        <Aurora
          colorStops={["#CC5429", "#111111", "#222222"]}
          blend={0.25}
          amplitude={0.5}
          speed={0.4}
        />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">


        {!isJoined ? (
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">Others ahead of you</p>
            <div className="text-6xl font-bold text-white">
              {totalUsers.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">Your position:</p>
            <div className="text-6xl font-bold text-white">
              #{position?.toLocaleString()}
            </div>
          </div>
        )}

        {!isJoined ? (
          <div className="bg-orange-900/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/40 mb-8">
            <h2 className="text-xl font-bold text-center text-white mb-2">Join the creator's program</h2>
            <p className="text-gray-400 text-center mb-6">Experience AI-Powered Prediction Markets</p>
            <form onSubmit={handleJoinWaitlist}>
              <div className="mb-4">
                <label htmlFor="username" className="sr-only">Your Twitter username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={isValidating}
                />
                {validationError && (
                  <p className="text-red-400 text-sm mt-2">{validationError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Join'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Primary waitlist card */}
            <div className="bg-orange-900/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/40 mb-4">
              <h2 className="text-2xl font-bold text-center text-white mb-2">#SpreddTheWord, {currentUser?.name ?? username}!</h2>
              <p className="text-orange-200 text-center mb-6">You're enrolled in the creator's program</p>
              <button onClick={handleShareX} className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-lg transition-colors mb-4">
                Share to Earn Points
              </button>
            </div>

            {/* Community card with increased height and mascot */}
            <div className="
  bg-orange-900/20 backdrop-blur-sm rounded-xl
  p-5 sm:p-6
  border border-orange-500/40
  mb-8 flex items-center gap-4
  relative overflow-visible z-10
  min-h-[120px] sm:min-h-[132px]
">
  <div className="flex-1">
    <div className="text-white font-semibold text-base sm:text-lg leading-tight">
      Stay updated with Spredd!
    </div>
    <div className="mt-2.5">
      <a
        href="https://t.me/+ZS1eOedd03YyOTlh"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-base py-2 px-4 rounded-full"
      >
<svg
  className="w-5 h-5"
  viewBox="0 0 24 24"
  fill="currentColor"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden
>
  <path d="M3.375 11.135q8.054-3.508 10.74-4.626c5.114-2.127 6.177-2.497 6.87-2.509.152-.003.493.035.713.214.186.151.238.356.262.499s.055.47.031.725c-.277 2.912-1.476 9.979-2.086 13.24-.259 1.38-.767 1.843-1.259 1.888-1.07.099-1.881-.706-2.917-1.385-1.621-1.063-2.537-1.724-4.11-2.761-1.818-1.198-.64-1.857.396-2.933.272-.282 4.984-4.568 5.075-4.957.011-.048.022-.23-.086-.325-.108-.096-.266-.063-.381-.037q-.244.055-7.768 5.134-1.102.757-1.997.738c-.658-.014-1.923-.372-2.863-.677-1.153-.375-2.07-.574-1.99-1.21q.062-.498 1.37-1.018" />
</svg>

        <span>Join the Community</span>
      </a>
    </div>
  </div>

  {/* Mascot (click to share) */}
  <button
    type="button"
    onClick={handleShareX}
    aria-label="Share to X"
    className="absolute bottom-0 right-[-22px] -translate-y-[1px] z-[4] p-0 border-0 bg-transparent cursor-pointer"
  >
    <img
      src="/oracleops.svg"
      alt="mascot"
      className="h-[126px] w-auto sm:h-[142px] md:h-[154px] object-contain object-right-bottom drop-shadow-2xl"
    />
  </button>

</div>
          </>
        )}

        {/* Users section with fade (always above any mascot overflow) */}
        {userList.length > 0 && (
          <div className="mt-8 relative z-20">
            <h3 className="text-gray-400 text-center mb-4">{isJoined ? 'Recent joiners:' : 'Users ahead of you:'}</h3>
            <div className="space-y-2 pb-10 relative">
              {userList.slice(0, 7).map((user) => (
                <WaitlistUser key={user.handle} {...user} />
              ))}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Waitlist;
