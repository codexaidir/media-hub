import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageTransition } from '../../components/PageTransition';
import { getSupabase } from '../../lib/supabase';

export function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  const state = location.state as { email?: string; name?: string; password?: string };

  useEffect(() => {
    if (!state?.email) {
      navigate('/signup');
    }
  }, [state, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOnChange = (
    { target }: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = target;
    const newOTP: string[] = [...otp];
    newOTP[index] = value.substring(value.length - 1);

    if (!value) setActiveOTPIndex(index - 1);
    else setActiveOTPIndex(index + 1);

    setOtp(newOTP);
    setError('');

    if (newOTP.every(v => v !== '')) {
      verifyOTP(newOTP.join(''));
    }
  };

  const handleOnKeyDown = (
    { key }: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (key === 'Backspace') {
      if (!otp[index]) {
        setActiveOTPIndex(index - 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.length > 0) {
      const newOTP = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6 && /^\d+$/.test(char)) {
          newOTP[index] = char;
        }
      });
      setOtp(newOTP);
      const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
      setActiveOTPIndex(nextIndex);
      
      if (newOTP.every(v => v !== '')) {
        verifyOTP(newOTP.join(''));
      }
    }
  };

  const verifyOTP = async (code: string) => {
    if (code.length !== 6) return;
    setIsLoading(true);
    
    try {
      const client = getSupabase();
      const email = (state.email || '').trim().toLowerCase();

      let result = await client.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (result.error) {
        result = await client.auth.verifyOtp({
          email,
          token: code,
          type: 'signup',
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data.session) {
        signIn({
          id: result.data.user.id,
          name: state.name || result.data.user.user_metadata?.full_name || state.email?.split('@')[0] || 'User',
          email: result.data.user.email || state.email || '',
        });
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      setActiveOTPIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    // Simulate sending email
  };

  return (
    <PageTransition>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
          
          <div className="p-8 sm:p-10">
            <Link to="/signup" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm">
                We sent a verification code to<br/>
                <span className="font-medium text-slate-800">{state?.email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <div className="flex justify-center items-center gap-2 sm:gap-3 mb-8">
              {otp.map((_, index) => {
                return (
                  <React.Fragment key={index}>
                    <input
                      ref={index === activeOTPIndex ? inputRef : null}
                      type="text"
                      className={`w-10 h-12 sm:w-12 sm:h-14 border-2 rounded-xl bg-transparent outline-none text-center font-semibold text-lg sm:text-xl transition-all ${
                        activeOTPIndex === index 
                          ? 'border-pink-500 ring-4 ring-pink-500/20' 
                          : 'border-slate-200 focus:border-pink-500 text-slate-800'
                      }`}
                      onChange={(e) => handleOnChange(e, index)}
                      onKeyDown={(e) => handleOnKeyDown(e, index)}
                      onPaste={handlePaste}
                      value={otp[index]}
                      disabled={isLoading}
                    />
                  </React.Fragment>
                );
              })}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-pink-600 text-sm font-medium mb-6">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying code...
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || isLoading}
                  className="font-semibold text-pink-600 hover:text-pink-500 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
