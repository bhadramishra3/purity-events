import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClientLogin() {
  const { user, loginWithGoogle, loginWithFacebook, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(user.isAdmin ? '/admin' : '/dashboard');
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const userData = await loginWithGoogle(credentialResponse.credential);
      navigate(userData.isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setError('');
    if (!window.FB) {
      setError('Facebook SDK not loaded. Please refresh and try again.');
      return;
    }
    window.FB.login(async (response) => {
      if (response.authResponse) {
        setLoading(true);
        try {
          const { accessToken, userID } = response.authResponse;
          const userData = await loginWithFacebook(accessToken, userID);
          navigate(userData.isAdmin ? '/admin' : '/dashboard');
        } catch (err) {
          setError(err.response?.data?.error || 'Facebook sign-in failed. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Facebook login was cancelled.');
      }
    }, { scope: 'email,public_profile' });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(adminEmail, adminPassword);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-cream-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card-luxury overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-gold-600 via-rose-500 to-burgundy-700" />

          <div className="p-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                <div className="w-12 h-12 rounded-full bg-gold-600 flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform">
                  <span className="text-white font-serif font-bold text-lg">P</span>
                </div>
              </Link>
              <h1 className="font-serif text-2xl text-charcoal mb-1">
                {adminMode ? 'Admin Login' : 'Welcome Back'}
              </h1>
              <p className="font-sans text-gray-400 text-sm">
                {adminMode
                  ? 'Sign in with your admin credentials'
                  : 'Sign in to access your client portal'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
                <p className="font-sans text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {!adminMode ? (
              /* ── OAuth Buttons ── */
              <div className="space-y-4">
                {/* Google */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-in failed. Please try again.')}
                    theme="outline"
                    size="large"
                    width="360"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-cream-300" />
                  <span className="font-sans text-xs text-gray-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-cream-300" />
                </div>

                {/* Facebook */}
                <button
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-[#1877F2] hover:bg-[#1468DB] text-white font-sans font-semibold text-sm rounded-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>

                <div className="text-center pt-4">
                  <p className="font-sans text-xs text-gray-400 leading-relaxed">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-gold-600 hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-gold-600 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Admin Form ── */
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="label-luxury">Admin Email</label>
                  <input
                    type="email"
                    className="input-luxury"
                    placeholder="admin@purityevents.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="label-luxury">Password</label>
                  <input
                    type="password"
                    className="input-luxury"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-burgundy"
                >
                  {loading ? 'Signing In…' : 'Sign In as Admin'}
                </button>
              </form>
            )}

            {/* Toggle admin/client */}
            <div className="text-center mt-6 pt-6 border-t border-cream-200">
              <button
                onClick={() => { setAdminMode(p => !p); setError(''); }}
                className="font-sans text-xs text-gray-400 hover:text-gold-600 transition-colors"
              >
                {adminMode ? '← Back to Client Login' : 'Admin Login →'}
              </button>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="font-sans text-sm text-gray-400 hover:text-gold-600 transition-colors">
            ← Back to Home
          </Link>
        </div>

        {/* What you get */}
        <div className="mt-8 card-luxury p-6">
          <h3 className="font-serif text-charcoal text-base mb-4 text-center">Client Portal Benefits</h3>
          <ul className="space-y-2">
            {[
              'View and manage all your bookings',
              'Create and share vision boards',
              'Track your event progress',
              'Direct communication with our team',
            ].map(benefit => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="text-gold-500 text-sm">✓</span>
                <span className="font-sans text-gray-600 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
