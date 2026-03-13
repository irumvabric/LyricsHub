import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Music, Search, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-yellow-400 font-black text-2xl tracking-tighter">
              <Music className="w-8 h-8" />
              LYRICSHUB
            </Link>
            
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-white/10 rounded-full bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-all"
                placeholder="Search songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  {user.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
                  <span className="hidden sm:inline">{user.role === 'admin' ? 'Admin' : 'Dashboard'}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors">Join</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
