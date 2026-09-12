'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('3fa9fa6690');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-6">Sign in to Ivy Homes</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
