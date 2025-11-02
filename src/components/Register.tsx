import { useState } from 'react';
import { useAuth } from '../contexts/localAuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '../utills/passwordValidator';
import { sanitizeInput, validateEmail, validateInputLength } from '../utills/inputValidator';
import { logActivity } from '../utills/activityLogger';

interface RegisterProps {
  onToggle: () => void;
}

export default function Register({ onToggle }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const { signUp } = useAuth();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordStrength(validation.strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      // Input length validation
      if (!validateInputLength(email, 255)) {
        setError('Email is too long');
        return;
      }

      // Email validation
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Sanitize email input
      const sanitizedEmail = sanitizeInput(email);

      // Password match check
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Strong password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return;
      }

      setLoading(true);
      const { error: signUpError } = await signUp(sanitizedEmail, password);

      if (signUpError) {
        // Generic error message to prevent information leakage
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists');
        } else {
          setError('Registration failed. Please try again.');
        }
        await logActivity('REGISTRATION_FAILED', { email: sanitizedEmail });
        setLoading(false);
      } else {
        setSuccess(true);
        await logActivity('REGISTRATION_SUCCESS', { email: sanitizedEmail });
        setLoading(false);
        setTimeout(() => onToggle(), 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 backdrop-blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-center text-gray-600 mb-8">Join Investify and start investing</p>

          {error && (
            <div className="bg-red-100/80 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100/80 backdrop-blur-sm border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  maxLength={128}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all`}
                        style={{ width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%' }}
                      />
                    </div>
                    <span className="text-xs font-medium capitalize">{passwordStrength}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Must contain: 8+ chars, uppercase, lowercase, number, special char
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={128}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onToggle}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}