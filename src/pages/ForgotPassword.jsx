import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { IoMail, IoShieldCheckmark, IoArrowBack } from 'react-icons/io5';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Input
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setTimer(60);
    }, 1000);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulate verification and routing to login
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base flex relative overflow-hidden items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel-deep dark:bg-darkbg-card/85 border border-slate-200/50 dark:border-white/10 rounded-[32px] shadow-2xl p-8 md:p-10 flex flex-col items-stretch">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 self-start">
          <IoArrowBack className="h-4 w-4" />
          Back to Sign In
        </Link>

        {step === 1 ? (
          <div>
            <div className="mb-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-darkbg-accent text-indigo-550 dark:text-brand-400 flex items-center justify-center mb-5 text-xl font-bold">
                🔑
              </div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Forgot Password?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                Enter your email address and we'll send a 4-digit code to verify your identity.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <IoMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/55 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full py-3.5 text-sm font-semibold"
              >
                Send Verification Code
              </Button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-darkbg-accent text-indigo-550 dark:text-brand-400 flex items-center justify-center mb-5 text-xl font-bold">
                <IoShieldCheckmark className="h-6 w-6" />
              </div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Enter OTP Code
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                We've sent a 4-digit code to <span className="font-bold text-slate-855 dark:text-slate-200">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex gap-4 justify-center">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    name="otp"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    className="h-14 w-14 bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl text-center font-display font-black text-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                ))}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={otp.join('').length < 4}
                className="w-full py-3.5 text-sm font-semibold"
              >
                Verify Code
              </Button>

              <div className="text-center text-xs text-slate-450 dark:text-slate-400">
                {timer > 0 ? (
                  <span>Resend code in <span className="font-bold text-indigo-650 dark:text-brand-400">{timer}s</span></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(60);
                    }}
                    className="font-bold text-indigo-600 dark:text-brand-400 hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
