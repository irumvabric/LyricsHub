import React, { useEffect, useState } from 'react';
import { SongCard } from '../components/SongCard';
import { Song, Artist } from '../types';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Users } from 'lucide-react';

export const Home: React.FC = () => {
  const [trending, setTrending] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, recentRes, artistsRes] = await Promise.all([
          fetch('/api/songs/trending'),
          fetch('/api/songs?limit=8'),
          fetch('/api/artists')
        ]);
        
        setTrending(await trendingRes.json());
        setRecent(await recentRes.json());
        setArtists(await artistsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-96 text-yellow-400">Loading...</div>;

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden rounded-3xl mt-4">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">THE WORLD'S BIGGEST<br/><span className="text-yellow-400">LYRICS HUB</span></h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Discover the meaning behind your favorite songs. Join thousands of artists and fans.</p>
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-yellow-400 w-6 h-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trending.map(song => <SongCard key={song.id} song={song} />)}
        </div>
      </section>

      {/* Recent Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-yellow-400 w-6 h-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Recently Added</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recent.map(song => <SongCard key={song.id} song={song} />)}
        </div>
      </section>

      {/* Featured Artists */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-yellow-400 w-6 h-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Featured Artists</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {artists.map(artist => (
            <Link key={artist.id} to={`/artist/${artist.id}`} className="flex-shrink-0 group text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-yellow-400 transition-all">
                <img 
                  src={artist.profile_image || `https://picsum.photos/seed/artist-${artist.id}/200/200`} 
                  className="w-full h-full object-cover"
                  alt={artist.name}
                />
              </div>
              <p className="text-white font-bold group-hover:text-yellow-400 transition-colors">{artist.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
