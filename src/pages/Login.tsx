import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { 
  IoArrowBackOutline, 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoLogInOutline,
  IoSparklesOutline
} from 'react-icons/io5';
import type { User } from '../types/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onBack: () => void;
}

export const Login: FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Google Sign-In Flow
  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setIsLoadingGoogle(true);

    // Simulate Google OAuth handshake
    setTimeout(() => {
      const googleUser: User = {
        id: `usr-google-${Date.now()}`,
        name: 'Alex Chen',
        email: 'alex.chen@gmail.com',
        avatar: '👤',
        provider: 'google',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      setIsLoadingGoogle(false);
      onLoginSuccess(googleUser);
    }, 600);
  };

  // 2. Email & Password Sign-In Flow
  const handleSubmitEmail = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters.');
      return;
    }

    setIsLoadingEmail(true);

    setTimeout(() => {
      const userName = isSignUp 
        ? (name.trim() || email.split('@')[0]) 
        : (email.split('@')[0] || 'User');

      // Capitalize first letter
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

      const emailUser: User = {
        id: `usr-email-${Date.now()}`,
        name: formattedName,
        email: email.trim(),
        avatar: '👤',
        provider: 'email',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      setIsLoadingEmail(false);
      onLoginSuccess(emailUser);
    }, 500);
  };

  // 3. Guest Flow
  const handleContinueAsGuest = () => {
    const guestUser: User = {
      id: `usr-guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@local',
      avatar: '✎',
      provider: 'guest',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    onLoginSuccess(guestUser);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 font-hand">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 text-base font-sketch font-bold text-[#6B6B6B] hover:text-[#242424] bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] hover:shadow-[3px_3px_0px_#242424] transition-all"
      >
        <IoArrowBackOutline className="text-lg" />
        <span>[ ← Back to Notebook ]</span>
      </button>

      {/* Main Login Card */}
      <div className="relative bg-white border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-9 shadow-[6px_6px_0px_#242424] -rotate-0.5 overflow-hidden">
        
        {/* Taped accents */}
        <div className="absolute -top-3.5 left-10 w-24 h-7 bg-[#FDE68A] border border-dashed border-[#6B6B6B] -rotate-2 pointer-events-none" />
        <div className="absolute -top-3.5 right-10 w-20 h-7 bg-[#BBF7D0] border border-dashed border-[#6B6B6B] rotate-2 pointer-events-none" />

        {/* Header */}
        <div className="text-center pt-2 pb-4 border-b-2 border-dashed border-[#6B6B6B]/30">
          <div className="flex justify-center mb-2">
            <img 
              src="/logo.png" 
              alt="StudyTime" 
              className="h-16 w-auto object-contain cursor-pointer hover:scale-105 transition-transform" 
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-handwriting text-[#242424] tracking-wide">
            {isSignUp ? 'CREATE AN ACCOUNT' : 'SIGN IN'}
          </h2>
          <p className="text-sm sm:text-base font-sketch text-[#6B6B6B] mt-1">
            {isSignUp 
              ? 'Start tracking your time and save all your sessions.' 
              : 'Sign in to access your streaks, subjects, and journal.'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-2.5 bg-[#FCA5A5]/40 border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] text-xs sm:text-sm font-sketch font-bold text-[#242424]">
            ⚠ {errorMsg}
          </div>
        )}

        {/* 1. Google Sign-In Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#242424] transition-all flex items-center justify-center gap-3 font-sketch font-bold text-base sm:text-lg group"
          >
            {isLoadingGoogle ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin text-xl">⏳</span> Connecting to Google...
              </span>
            ) : (
              <>
                <FcGoogle className="text-2xl group-hover:scale-110 transition-transform" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Sketched Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-[#6B6B6B]/40" />
          </div>
          <span className="relative bg-white px-3 text-xs sm:text-sm font-sketch font-bold text-[#6B6B6B] uppercase tracking-wider">
            or sign in with email
          </span>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleSubmitEmail} className="space-y-4">
          {/* Name input (only for Sign Up) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
                Your Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-2.5 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:ring-1 focus:ring-[#242424]"
                required={isSignUp}
              />
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              className="w-full bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-2.5 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:ring-1 focus:ring-[#242424]"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-sketch font-bold text-[#242424]">
                Password:
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-sketch text-[#6B6B6B] hover:text-[#242424] flex items-center gap-1"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-2.5 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:ring-1 focus:ring-[#242424]"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-sketch pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-[#242424] text-[#242424] focus:ring-0 cursor-pointer"
              />
              <span className="text-[#6B6B6B]">Remember this device</span>
            </label>

            {!isSignUp && (
              <span className="text-[#6B6B6B] hover:text-[#242424] cursor-pointer hover:underline">
                Forgot password?
              </span>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoadingEmail}
              className="w-full py-2.5 text-lg font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#242424] transition-all -rotate-0.5 hover:rotate-0 flex items-center justify-center gap-2"
            >
              {isLoadingEmail ? (
                <span>Signing in... ✎</span>
              ) : (
                <>
                  <IoLogInOutline className="text-xl" />
                  <span>[ {isSignUp ? 'Create Account' : 'Sign In'} ✎ ]</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-6 pt-4 border-t border-dashed border-[#6B6B6B]/30 text-center text-sm font-sketch">
          {isSignUp ? (
            <p className="text-[#6B6B6B]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
                className="font-bold text-[#242424] underline hover:text-amber-700"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-[#6B6B6B]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
                className="font-bold text-[#242424] underline hover:text-amber-700"
              >
                Create a Free Account
              </button>
            </p>
          )}
        </div>

        {/* 3. Continue as Guest Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="text-xs sm:text-sm font-sketch text-[#6B6B6B] hover:text-[#242424] inline-flex items-center gap-1 py-1 px-3 rounded hover:bg-[#FAF9F6] transition"
          >
            <IoSparklesOutline />
            <span>Continue as Guest (offline mode) →</span>
          </button>
        </div>

      </div>
    </div>
  );
};
