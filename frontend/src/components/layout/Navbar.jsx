import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Code2, LogOut, Moon, Sun, User, LayoutDashboard, Shield, Search } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-2xl hover:opacity-90 transition-opacity">
            <Code2 className="h-8 w-8 text-indigo-500" />
            <span>Dev<span className="text-indigo-400">Resolve</span></span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-10">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doubts..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-5 py-3.5 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/ask">
                  <Button size="sm">Ask a Doubt</Button>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                      {user?.username?.slice(0, 2).toUpperCase()}
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2.5 animate-fade-in">
                      <div className="px-5 py-3.5 border-b border-gray-800">
                        <p className="text-base font-medium text-white">{user?.username}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        <p className="text-sm text-indigo-400 mt-1">{user?.reputationPoints || 0} points</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link to={`/profile/${user?.username}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-800 mt-2 pt-2">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:bg-gray-800 w-full text-left">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="md">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="md">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
