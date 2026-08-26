import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginAdmin({ email, password });
      login(res.email, res.token);
      navigate('/dashboard');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
};
