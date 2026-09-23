import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { 
  IoArrowBackOutline, 
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';
import type { User } from '../types/auth';
import { apiGoogleAuth, apiGuestAuth } from '../utils/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { 
            client_id: string; 
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: (notification?: unknown) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onBack: () => void;
}

const DEFAULT_GOOGLE_CLIENT_ID = '924836308076-nkkkg7k7s3mo8elnd2mokublrupovj6f.apps.googleusercontent.com';

export const Login: FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

  // Initialize official Google Identity Services
  useEffect(() => {
    const initGoogleGIS = () => {
      if (!window.google?.accounts?.id || !googleClientId) return;

      try {
        // Initialize One-Tap / ID token listener
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) return;
            setIsLoadingGoogle(true);
            setErrorMsg('');
            try {
              const res = await apiGoogleAuth({ credential: response.credential });
              setSuccessMsg(`Welcome, ${res.user.name}!`);
              setTimeout(() => onLoginSuccess(res.user), 400);
            } catch (err: unknown) {
              setErrorMsg(err instanceof Error ? err.message : 'Google authentication failed');
            } finally {
              setIsLoadingGoogle(false);
            }
          }
        });
      } catch (err) {
        console.warn('Google Identity Services initialization notice:', err);
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGIS();
    } else {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleGIS;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', initGoogleGIS);
      }
    }
  }, [googleClientId, onLoginSuccess]);

  // Real Google OAuth 2.0 Popup Flow
  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoadingGoogle(true);

    if (!window.google?.accounts?.oauth2) {
      // Fallback to One-Tap prompt
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
        setIsLoadingGoogle(false);
        return;
      }
      setErrorMsg('Google Sign-In is initializing. Please wait a moment and try again.');
      setIsLoadingGoogle(false);
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setErrorMsg('Google Sign-In was cancelled. Please try again.');
            setIsLoadingGoogle(false);
            return;
          }

          if (!tokenResponse.access_token) {
            setErrorMsg('No access token returned from Google.');
            setIsLoadingGoogle(false);
            return;
          }

          try {
            // Fetch real user profile from Google
            const googleUserInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });

            if (!googleUserInfoRes.ok) {
              throw new Error('Failed to retrieve user profile from Google');
            }

            const profile = await googleUserInfoRes.json();

            // Register / login via MySQL backend
            const backendRes = await apiGoogleAuth({
              email: profile.email,
              name: profile.name || profile.given_name || profile.email.split('@')[0],
              avatar: profile.picture
            });

            setSuccessMsg(`Welcome, ${backendRes.user.name}!`);
            setTimeout(() => onLoginSuccess(backendRes.user), 400);
          } catch (err: unknown) {
            console.error('Error finishing Google login:', err);
            setErrorMsg(err instanceof Error ? err.message : 'Google authentication failed');
          } finally {
            setIsLoadingGoogle(false);
          }
        }
      });

      tokenClient.requestAccessToken();
    } catch (err: unknown) {
      console.error('Failed to launch Google OAuth popup:', err);
      setIsLoadingGoogle(false);
      setErrorMsg('Could not open Google Sign-In. Please make sure popups are allowed in your browser.');
    }
  };

  // Continue as Guest
  const handleContinueAsGuest = async () => {
    setErrorMsg('');
    setIsLoadingGuest(true);
    try {
      const res = await apiGuestAuth();
      onLoginSuccess(res.user);
    } catch {
      // Offline fallback
      const guestUser: User = {
        id: `usr-guest-${Date.now()}`,
        name: 'Guest User',
        email: 'guest@local',
        avatar: '✎',
        provider: 'guest',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      onLoginSuccess(guestUser);
    } finally {
      setIsLoadingGuest(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 font-hand">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 text-base font-sketch font-bold text-[#6B6B6B] hover:text-[#242424] bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] hover:shadow-[3px_3px_0px_#242424] transition-all cursor-pointer"
      >
        <IoArrowBackOutline className="text-lg" />
        <span>[ ← Back to Notebook ]</span>
      </button>

      {/* Main Login Card */}
      <div className="relative bg-white border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-8 sm:p-10 shadow-[6px_6px_0px_#242424]">

        {/* Tape accents */}
        <div className="absolute -top-3.5 left-10 w-24 h-7 bg-[#FDE68A] border border-dashed border-[#6B6B6B] -rotate-2 pointer-events-none" />
        <div className="absolute -top-3.5 right-10 w-20 h-7 bg-[#BBF7D0] border border-dashed border-[#6B6B6B] rotate-2 pointer-events-none" />

        {/* Header */}
        <div className="text-center pt-2 pb-6 border-b-2 border-dashed border-[#6B6B6B]/30">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="StudyTime"
              className="h-16 w-auto object-contain hover:scale-105 transition-transform"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-handwriting text-[#242424] tracking-wide uppercase">
            Sign In
          </h2>
          <p className="text-sm sm:text-base font-sketch text-[#6B6B6B] mt-1">
            Sign in with your Google account to save your progress, streaks, and study history.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-5 p-3 bg-[#FCA5A5]/40 border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] text-xs sm:text-sm font-sketch font-bold text-[#242424] flex items-start gap-2">
            <IoAlertCircleOutline className="text-xl text-red-700 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mt-5 p-2.5 bg-[#BBF7D0]/60 border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] text-xs sm:text-sm font-sketch font-bold text-[#242424] flex items-center gap-1.5">
            <IoCheckmarkCircleOutline className="text-lg text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="mt-7">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || isLoadingGuest}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#242424] transition-all flex items-center justify-center gap-3 font-sketch font-bold text-base sm:text-lg group cursor-pointer disabled:opacity-60"
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

        {/* Privacy note */}
        <p className="text-center text-xs font-sketch text-[#6B6B6B] mt-4 px-2">
          🔒 We only use your name and profile picture. No personal data is shared.
        </p>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-[#6B6B6B]/40" />
          </div>
          <span className="relative bg-white px-3 text-xs sm:text-sm font-sketch font-bold text-[#6B6B6B] uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Continue as Guest */}
        <button
          type="button"
          onClick={handleContinueAsGuest}
          disabled={isLoadingGoogle || isLoadingGuest}
          className="w-full py-2.5 text-sm font-sketch font-bold text-[#6B6B6B] hover:text-[#242424] bg-[#FAF9F6] hover:bg-[#f0ede6] border-2 border-dashed border-[#6B6B6B]/60 hover:border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isLoadingGuest ? (
            <span className="inline-flex items-center gap-2">
              <span className="animate-spin text-base">⏳</span> Loading guest mode...
            </span>
          ) : (
            <>
              <IoSparklesOutline className="text-base" />
              <span>Continue as Guest (offline mode)</span>
            </>
          )}
        </button>

        <p className="text-center text-xs font-sketch text-[#6B6B6B]/70 mt-3">
          Guest sessions are not saved to the cloud.
        </p>
      </div>
    </div>
  );
};
