import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist, Song } from '../types';
import { SongCard } from '../components/SongCard';
import { Globe, Twitter, Instagram, Music } from 'lucide-react';

export const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist & { songs: Song[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await fetch(`/api/artists/${id}`);
        if (res.ok) {
          setArtist(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-96 text-yellow-400">Loading...</div>;
  if (!artist) return <div className="text-center py-20 text-white text-2xl">Artist not found</div>;

  return (
    <div className="pb-20">
      <div className="relative h-80 rounded-3xl overflow-hidden mb-8">
        <img 
          src={artist.profile_image || `https://picsum.photos/seed/artist-${artist.id}/1200/400`} 
          className="w-full h-full object-cover opacity-50"
          alt={artist.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-end gap-6">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl">
            <img 
              src={artist.profile_image || `https://picsum.photos/seed/artist-${artist.id}/400/400`} 
              className="w-full h-full object-cover"
              alt={artist.name}
            />
          </div>
          <div className="mb-4">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{artist.name}</h1>
            <div className="flex gap-4 mt-2">
              <Globe className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-white uppercase mb-8 border-l-4 border-yellow-400 pl-4">Songs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {artist.songs.map(song => <SongCard key={song.id} song={song} />)}
          </div>
          {artist.songs.length === 0 && <p className="text-gray-500">No songs published yet.</p>}
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Biography</h3>
            <p className="text-gray-400 leading-relaxed">
              {artist.bio || "No biography available for this artist."}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Artist Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Songs</span>
                <span className="text-white font-bold">{artist.songs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Views</span>
                <span className="text-white font-bold">
                  {artist.songs.reduce((acc, s) => acc + s.views, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
