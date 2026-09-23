import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = (await loginAdmin({ email, password })) as any;
      if (res?.success) {
        setAuth(res.data.token, res.data.admin);
        navigate('/dashboard');
      }
    } catch (err: any) { console.error(err); }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-card border border-border rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-text-primary mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm" required />
        <button type="submit" className="w-full bg-gold text-text-primary py-2.5 rounded-lg font-medium hover:bg-gold-bright transition-colors">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
