import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileQuestion, Users, Settings, LogOut } from 'lucide-react';
import QuestionManager from './pages/QuestionManager';
import Login from './pages/Login';

function DashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/questions" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <FileQuestion className="h-8 w-8 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Question Bank</h2>
          <p className="text-gray-600">Manage practice questions, options, and explanations.</p>
        </Link>
        <div className="p-6 bg-white rounded-lg shadow opacity-50 cursor-not-allowed">
          <Users className="h-8 w-8 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Users (Coming Soon)</h2>
          <p className="text-gray-500">Manage registered members and subscriptions.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow opacity-50 cursor-not-allowed">
          <Settings className="h-8 w-8 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Settings (Coming Soon)</h2>
          <p className="text-gray-500">Platform configuration and logs.</p>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center">
            <LayoutDashboard className="mr-2" /> Admin Panel
          </h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link 
            to="/" 
            className={`flex items-center p-2 rounded hover:bg-gray-800 ${location.pathname === '/' ? 'bg-gray-800 text-blue-400' : ''}`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
          </Link>
          <Link 
            to="/questions" 
            className={`flex items-center p-2 rounded hover:bg-gray-800 ${location.pathname === '/questions' ? 'bg-gray-800 text-blue-400' : ''}`}
          >
            <FileQuestion className="mr-3 h-5 w-5" /> Questions
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-2 text-red-400 hover:bg-gray-800 rounded transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/questions" 
          element={
            <ProtectedRoute>
              <QuestionManager />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
