import { useState } from 'react';
import { useAuth } from '../contexts/localAuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { sanitizeInput, detectSQLInjection, detectXSS } from '../utills/inputValidator';
import { logActivity } from '../utills/activityLogger';

interface LoginProps {
  onToggle: () => void;
}

export default function Login({ onToggle }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check for SQL injection attempts
      if (detectSQLInjection(email) || detectSQLInjection(password)) {
        setError('Invalid input detected');
        await logActivity('SQL_INJECTION_ATTEMPT', { email: sanitizeInput(email) });
        setLoading(false);
        return;
      }

      // Check for XSS attempts
      if (detectXSS(email)) {
        setError('Invalid input detected');
        await logActivity('XSS_ATTEMPT', { email: sanitizeInput(email) });
        setLoading(false);
        return;
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);

      const { error: signInError } = await signIn(sanitizedEmail, password);

      if (signInError) {
        if (signInError.message.includes('locked')) {
          setError(signInError.message);
          await logActivity('ACCOUNT_LOCKED', { email: sanitizedEmail });
        } else {
          setError('Invalid email or password');
          await logActivity('LOGIN_FAILED', { email: sanitizedEmail });
        }
        setLoading(false);
      } else {
        await logActivity('LOGIN_SUCCESS', { email: sanitizedEmail });
        // No need to manually navigate - AuthContext will handle it
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 backdrop-blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8">Sign in to manage your portfolio</p>

          {error && (
            <div className="bg-red-100/80 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
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
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onToggle}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}