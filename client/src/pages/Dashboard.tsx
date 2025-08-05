import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import ResumeUpload from "../components/interview/ResumeUpload";
import { User, LogOut, Settings, Bell, Brain } from "lucide-react";
import axiosInstance from "../config/axiosConfig";

const Dashboard = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    await axiosInstance.post('/api/auth/logout');
    // Force full page reload to clear all session state
    window.location.href = '/login';
  } catch (err) {
    console.error('Logout failed:', err);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view this dashboard.
          </p>
          <button
            onClick={() => {
              navigate("/login");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  <Brain className="w-6 h-6" />
                </span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HireSense
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-200"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Welcome back, {user.name.split(" ")[0]}! 👋
                </h2>
                <p className="text-gray-600 mb-3">{user.email}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </div>
                  <div className="text-sm text-gray-500">
                    Last active: Just now
                  </div>
                </div>
              </div>
              <div className="hidden md:flex flex-col gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs opacity-90">Analyses</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-xs opacity-90">Match Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">12</div>
                <div className="text-sm text-gray-600">Resumes Analyzed</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">89</div>
                <div className="text-sm text-gray-600">Questions Generated</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">4.9</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Upload Component */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <ResumeUpload />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
