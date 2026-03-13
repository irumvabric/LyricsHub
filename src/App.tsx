import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { SongPage } from './pages/SongPage';
import { ArtistPage } from './pages/ArtistPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ArtistDashboard } from './pages/ArtistDashboard';
import { SongForm } from './pages/SongForm';
import { AdminPanel } from './pages/AdminPanel';
import { SearchPage } from './pages/SearchPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'admin' | 'artist' }> = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lyrics/:id" element={<SongPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Artist Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="artist">
              <ArtistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/add" element={
            <ProtectedRoute role="artist">
              <SongForm />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/edit/:id" element={
            <ProtectedRoute role="artist">
              <SongForm />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-yellow-400 font-black text-xl tracking-tighter mb-4">LYRICSHUB</p>
          <p className="text-gray-500 text-sm">© 2026 LyricsHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
