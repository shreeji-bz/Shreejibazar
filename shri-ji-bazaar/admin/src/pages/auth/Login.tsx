import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/authService';
import { Lock, Mail } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth, isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      if (response.success) {
        setAuth(response.data.token, response.data.admin);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-dark via-gold to-gold-bright mx-auto flex items-center justify-center mb-4 shadow-lg shadow-gold/20">
            <span className="text-white font-bold text-xl">SJ</span>
          </div>
          <h1 className="text-2xl font-bold text-gold-bright">Admin Panel</h1>
          <p className="text-text-muted mt-1">Shri Ji Bazaar</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {error && <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-2.5 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@shrijibazaar.com" className="pl-9" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="pl-9" required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          <button
            type="button"
            onClick={() => { setEmail('admin@shrijibazaar.com'); setPassword('admin123'); }}
            className="w-full text-sm text-gold hover:text-gold-bright underline mt-2"
          >
            Quick Login (Demo)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
