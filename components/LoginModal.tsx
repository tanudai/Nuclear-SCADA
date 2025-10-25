import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (user: string, pass: string) => void;
  error: string | null;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-sm border border-teal-500/30">
        <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 mb-3 bg-teal-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-teal-400">SCADA Authentication</h2>
            <p className="text-gray-400 text-sm mt-1">Enter credentials to access controls.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 bg-gray-900 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 bg-gray-900 text-gray-200 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="bg-red-500/20 text-red-300 text-xs italic text-center p-2 rounded-md mb-4">{error}</p>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
