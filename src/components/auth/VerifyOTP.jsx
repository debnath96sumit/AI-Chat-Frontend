import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Email from forgot password page

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
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
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(4 - newOtp.length).fill('')]);
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');

    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Navigate to reset password with verification token
        setTimeout(() => {
          navigate('/reset-password', {
            state: {
              email,
              verificationToken: data.verificationToken || otpCode
            }
          });
        }, 1000);
      } else {
        setError(data.message || 'Invalid or expired code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimer(60); // Reset timer
        setOtp(['', '', '', '']); // Clear OTP inputs
        inputRefs.current[0]?.focus(); // Focus first input
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div>
          <Link 
            to="/forgot-password" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition mb-4"
          >
            <FaArrowLeft />
            Back
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-3xl text-purple-400" />
            </div>
          </div>

          <h2 className="text-center text-3xl font-bold text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            We've sent a 4-digit code to
          </p>
          <p className="text-center text-sm text-purple-400 font-medium">
            {email}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
            Code verified successfully! Redirecting...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* OTP Input Boxes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
              Enter 4-digit code
            </label>
            <div className="flex gap-3 justify-center">
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
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading || success}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-600 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify Code'}
            </button>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {timer} seconds
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </form>

        <div className="text-center pt-4 border-t border-slate-700">
          <p className="text-sm text-gray-400">
            Remember your password?{' '}
            <Link to="/sign-in" className="font-medium text-purple-400 hover:text-purple-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;