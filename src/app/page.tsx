'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [aadharCardNumber, setAadharCardNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 Starting login process...');
      console.log('📤 Sending login request with:', { 
        aadharCardNumber: parseInt(aadharCardNumber), 
        password: '***' 
      });
      
      const response = await axios.post('/api/user/login', {
        aadharCardNumber: parseInt(aadharCardNumber),
        password,
      });

      console.log('✅ Login API response:', response.data);
      const { token, role } = response.data;
      
      console.log('🔐 Token received:', token ? 'Yes' : 'No');
      console.log('👤 Role received:', role);
      
      // Use the login method from AuthContext
      console.log('🔗 Calling AuthContext login...');
      login(token, role);

      console.log('🧭 Preparing redirect for role:', role);
      
      // Determine redirect URL
      const redirectUrl = role === 'admin' ? '/admin-dashboard' : '/voter-dashboard';
      console.log('🎯 Target URL:', redirectUrl);
      console.log('🕰️ Current timestamp:', new Date().toISOString());
      
      // Multiple redirect methods for reliability
      setTimeout(() => {
        console.log('🚀 Attempting redirect...');
        
        try {
          // Method 1: Next.js router (preferred)
          console.log('📍 Trying router.push...');
          router.push(redirectUrl);
          
          // Method 2: Fallback after 500ms if router.push fails
          setTimeout(() => {
            if (window.location.pathname === '/') {
              console.log('⚠️ Router.push failed, trying router.replace...');
              router.replace(redirectUrl);
              
              // Method 3: Final fallback after another 500ms
              setTimeout(() => {
                if (window.location.pathname === '/') {
                  console.log('🔄 Router methods failed, using window.location...');
                  window.location.href = redirectUrl;
                }
              }, 500);
            }
          }, 500);
          
        } catch (error) {
          console.error('❌ Router error:', error);
          console.log('🔄 Using window.location as fallback...');
          window.location.href = redirectUrl;
        }
      }, 100);
      
    } catch (error: unknown) {
      console.error('❌ Login error:', error);
      const errText = (error as any).response?.data?.error || 'Login failed.';
      setError(errText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            E-Voting App
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700">
              Aadhaar Number
            </label>
            <input
              id="aadhaar"
              name="aadhaar"
              type="text"
              required
              value={aadharCardNumber}
              onChange={(e) => setAadharCardNumber(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your 12-digit Aadhaar number"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
