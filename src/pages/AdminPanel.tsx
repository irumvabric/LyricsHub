import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Song, Artist, User } from '../types';
import { Shield, Users, Music, CheckCircle, XCircle, Trash2, Eye, BarChart3 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingSongs, setPendingSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/songs?status=pending', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      setStats(await statsRes.json());
      setPendingSongs(await pendingRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96 text-yellow-400">Loading...</div>;

  return (
    <div className="py-8 space-y-12">
      <div className="flex items-center gap-4">
        <Shield className="w-10 h-10 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Admin Control Panel</h1>
          <p className="text-gray-400">Manage content, users, and platform health</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-yellow-400 mb-2">
            <Music className="w-5 h-5" />
            <span className="text-sm font-bold uppercase">Total Songs</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalSongs}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-orange-400 mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-bold uppercase">Pending</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.pendingSongs}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold uppercase">Artists</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalArtists}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-bold uppercase">Total Views</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Pending Approval */}
      <section>
        <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-yellow-400" />
          Pending Approval
        </h2>
        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Song</th>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Artist</th>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingSongs.map(song => (
                <tr key={song.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-bold">{song.title}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{song.artist_name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleApprove(song.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-all">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(song.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingSongs.length === 0 && <div className="py-12 text-center text-gray-500">No pending songs to approve.</div>}
        </div>
      </section>

      {/* User Management */}
      <section>
        <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-400" />
          User Management
        </h2>
        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Name</th>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Email</th>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Role</th>
                <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-bold">{u.name}</td>
                  <td className="px-6 py-4 text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-400/10 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(u.created_at as any).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
