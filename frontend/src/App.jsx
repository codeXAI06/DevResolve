import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoubtDetail from './pages/DoubtDetail';
import AskDoubt from './pages/AskDoubt';
import Tags from './pages/Tags';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Rewards from './pages/Rewards';
import CollabRooms from './pages/CollabRooms';
import CollabRoom from './pages/CollabRoom';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDoubts from './pages/admin/ManageDoubts';

export default function App() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doubts" element={<Home />} />
        <Route path="/doubts/:id" element={<DoubtDetail />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:username" element={<Profile />} />

        {/* Protected */}
        <Route path="/ask" element={<ProtectedRoute><AskDoubt /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/collab" element={<ProtectedRoute><CollabRooms /></ProtectedRoute>} />
        <Route path="/collab/:id" element={<ProtectedRoute><CollabRoom /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/doubts" element={<ProtectedRoute adminOnly><ManageDoubts /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
              <p className="text-gray-400 mb-4">Page not found</p>
              <a href="/" className="text-indigo-400 hover:text-indigo-300">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
