import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code2, ArrowLeft, RefreshCw, CheckCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or the next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    const result = await verifyOTP(email, otpString);
    setIsLoading(false);

    if (result.success) {
      toast.success('Account verified successfully! 🎉');
      navigate('/app/dashboard');
    } else {
      toast.error(result.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    const result = await resendOTP(email);
    setResendLoading(false);

    if (result.success) {
      toast.success('OTP sent successfully!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      toast.error(result.error || 'Failed to resend OTP');
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <Code2 className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold">DSA Tracker</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Almost There! 🎯
            </h1>
            <p className="text-lg text-purple-100 leading-relaxed">
              We've sent a 6-digit verification code to your email. Enter it below to complete your registration.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="p-2 rounded-lg bg-white/20">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-purple-200">Code sent to {email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="p-2 rounded-lg bg-white/20">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Secure verification</p>
                <p className="text-sm text-purple-200">Your account is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Register
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-6 shadow-lg">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the 6-digit code sent to<br />
              <span className="font-medium text-gray-900 dark:text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 
                    border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-white
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
                    transition-all duration-200
                    hover:border-gray-300 dark:hover:border-gray-600"
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-purple-600 
                hover:from-violet-700 hover:to-purple-700 
                text-white font-semibold rounded-xl shadow-lg 
                shadow-purple-500/25 hover:shadow-purple-500/40 
                transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Verify & Continue
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                Didn't receive the code?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 
                    dark:text-purple-400 dark:hover:text-purple-300 
                    font-medium transition-colors"
                >
                  {resendLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend OTP
                    </>
                  )}
                </button>
              ) : (
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Resend in <span className="font-medium text-purple-600 dark:text-purple-400">{countdown}s</span>
                </p>
              )}
            </div>
          </form>

          {/* Help text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-8">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
