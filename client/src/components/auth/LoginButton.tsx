import { LogIn, Chrome } from 'lucide-react';

const LoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'https://hire-sense-client-faxy-wheat.vercel.app/api/auth/google';
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-3 group"
      >
        <Chrome className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
        <span>Continue with Google</span>
      </button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-3">
        <LogIn className="w-5 h-5" />
        <span>Sign In</span>
      </button>
      
      <div className="text-center text-xs text-gray-400 mt-4">
        <p>Secure authentication powered by Google OAuth 2.0</p>
      </div>
    </div>
  );
};

export default LoginButton;