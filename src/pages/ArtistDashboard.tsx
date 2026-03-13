import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Song } from '../types';
import { Plus, Edit2, Trash2, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArtistDashboard: React.FC = () => {
  const { token } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySongs = async () => {
      try {
        const res = await fetch('/api/my-songs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setSongs(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMySongs();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSongs(songs.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96 text-yellow-400">Loading...</div>;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Artist Dashboard</h1>
          <p className="text-gray-400">Manage your songs and view performance</p>
        </div>
        <Link to="/dashboard/add" className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-300 transition-colors">
          <Plus className="w-5 h-5" />
          Add New Lyrics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Total Songs</p>
          <p className="text-3xl font-black text-white">{songs.length}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Total Views</p>
          <p className="text-3xl font-black text-white">{songs.reduce((acc, s) => acc + s.views, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Approved Songs</p>
          <p className="text-3xl font-black text-white">{songs.filter(s => s.status === 'approved').length}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Song</th>
              <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Status</th>
              <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Views</th>
              <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs">Added On</th>
              <th className="px-6 py-4 text-gray-400 font-bold uppercase text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {songs.map(song => (
              <tr key={song.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={song.cover_image || `https://picsum.photos/seed/${song.id}/50/50`} className="w-10 h-10 rounded object-cover" alt="" />
                    <span className="text-white font-bold">{song.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {song.status === 'approved' ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {song.views}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {new Date(song.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/dashboard/edit/${song.id}`} className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(song.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {songs.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            No songs added yet. Start by adding your first lyrics!
          </div>
        )}
      </div>
    </div>
  );
};
