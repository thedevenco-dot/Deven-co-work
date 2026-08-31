import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Lock } from 'lucide-react';
import { api } from '@/services/api';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.login(username, password);
      setLocation('/admin');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-noise min-h-screen bg-[#0C0C0C] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="logo text-[#F1F1F1]">
            <span className="logo-mark" aria-hidden="true"><span /><span /></span>
            <span className="font-display text-[21px] tracking-[.02em]">DEVEN</span>
            <span className="mt-[3px] text-[9px] font-bold tracking-[.18em] text-[#A3A3A3]">COWORK</span>
          </div>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl md:text-[44px] font-[650] leading-[1.1] tracking-[.02em] text-[#F1F1F1]">
          ADMIN PORTAL
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-[#024E5C] bg-[#0C0C0C] py-8 px-4 sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="field-label">
                Username
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </label>
            </div>

            <div>
              <label className="field-label">
                Password
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>
            </div>

            {error && (
              <p className="border border-[#a85a4f] bg-[#301b18] p-3 text-sm leading-5 text-[#ffc0b6]" role="alert">
                {error}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="button button-primary w-full justify-center"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-[#024E5C] pt-4 flex justify-between items-center text-xs text-[#A3A3A3]">
            <a href="/" className="inline-flex items-center gap-1 hover:text-[#04B8BB] transition-colors">
              <ArrowLeft size={12} /> Back to Site
            </a>
            <span className="inline-flex items-center gap-1">
              <Lock size={12} /> Secure Area
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
