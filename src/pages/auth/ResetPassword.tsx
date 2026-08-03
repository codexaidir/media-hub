import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Lock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';

export function ResetPassword() {
  const [step, setStep] = useState<'otp' | 'new_password'>('otp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [successMsg, setSuccessMsg] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    special: false
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string };

  useEffect(() => {
    if (!state?.email) {
      navigate('/forgot-password');
    }
  }, [state, navigate]);

  useEffect(() => {
    if (step === 'otp') {
      inputRef.current?.focus();
    }
  }, [activeOTPIndex, step]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (code.startsWith('1')) {
        throw new Error('Invalid verification code');
      }

      setStep('new_password');
      setError('');
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
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!passwordStrength.length || !passwordStrength.number || !passwordStrength.special) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMsg('Password reset successful. Redirecting to sign in...');
      
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthText = strengthScore === 0 ? 'Weak' : strengthScore === 1 ? 'Fair' : strengthScore === 2 ? 'Good' : 'Strong';
  const strengthColor = strengthScore === 0 ? 'bg-red-500' : strengthScore === 1 ? 'bg-orange-500' : strengthScore === 2 ? 'bg-blue-500' : 'bg-green-500';

  return (
    <PageTransition>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
          
          <div className="p-8 sm:p-10">
            {step === 'otp' ? (
              <Link to="/forgot-password" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            ) : null}

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {step === 'otp' ? 'Verification code' : 'Create new password'}
              </h1>
              <p className="text-slate-500 text-sm">
                {step === 'otp' 
                  ? <>We sent a verification code to<br/><span className="font-medium text-slate-800">{state?.email}</span></>
                  : 'Your new password must be different from previously used passwords.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{successMsg}</p>
              </div>
            )}

            {step === 'otp' ? (
              <>
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
              </>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-colors sm:text-sm"
                      placeholder="Enter new password"
                      disabled={isLoading || !!successMsg}
                    />
                  </div>
                  
                  {password.length > 0 && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1.5 w-8 rounded-full transition-colors ${i < strengthScore ? strengthColor : 'bg-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500">{strengthText}</span>
                      </div>
                      <ul className="text-xs space-y-2">
                        <li className={`flex items-center gap-2 ${passwordStrength.length ? 'text-green-600' : 'text-slate-500'}`}>
                          {passwordStrength.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          At least 8 characters
                        </li>
                        <li className={`flex items-center gap-2 ${passwordStrength.number ? 'text-green-600' : 'text-slate-500'}`}>
                          {passwordStrength.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          Contains a number
                        </li>
                        <li className={`flex items-center gap-2 ${passwordStrength.special ? 'text-green-600' : 'text-slate-500'}`}>
                          {passwordStrength.special ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          Contains a special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      className={`block w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-colors sm:text-sm ${
                        confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                      }`}
                      placeholder="Confirm new password"
                      disabled={isLoading || !!successMsg}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !!successMsg}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
