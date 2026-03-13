import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Song } from '../types';
import { getYouTubeId, formatDate } from '../lib/utils';
import { Youtube, Share2, Calendar, Music2, Disc } from 'lucide-react';

export const SongPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSong(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-96 text-yellow-400">Loading...</div>;
  if (!song) return <div className="text-center py-20 text-white text-2xl">Song not found</div>;

  const youtubeId = song.youtube_link ? getYouTubeId(song.youtube_link) : null;

  return (
    <div className="pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 py-12 border-b border-white/10">
        <div className="w-full md:w-80 flex-shrink-0">
          <img 
            src={song.cover_image || `https://picsum.photos/seed/${song.id}/400/400`} 
            alt={song.title}
            className="w-full aspect-square object-cover rounded-2xl shadow-2xl shadow-yellow-400/10"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-grow flex flex-col justify-end">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-widest text-sm">
              <Music2 className="w-4 h-4" />
              {song.genre || 'Music'}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              {song.title}
            </h1>
            <Link to={`/artist/${song.artist_id}`} className="text-2xl md:text-3xl font-bold text-gray-400 hover:text-yellow-400 transition-colors">
              {song.artist_name}
            </Link>
            
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Disc className="w-5 h-5" />
                <span>{song.album || 'Single'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{song.release_year || 'N/A'}</span>
              </div>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-white uppercase mb-8 border-l-4 border-yellow-400 pl-4">Lyrics</h2>
          <pre className="text-xl md:text-2xl text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
            {song.lyrics}
          </pre>
        </div>

        <div className="space-y-8">
          {youtubeId && (
            <div>
              <h2 className="text-xl font-black text-white uppercase mb-4 flex items-center gap-2">
                <Youtube className="text-red-500" />
                Watch Video
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">About the Artist</h3>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={song.artist_image || `https://picsum.photos/seed/artist-${song.artist_id}/100/100`} 
                className="w-16 h-16 rounded-full object-cover"
                alt={song.artist_name}
              />
              <div>
                <p className="font-bold text-white">{song.artist_name}</p>
                <Link to={`/artist/${song.artist_id}`} className="text-yellow-400 text-sm hover:underline">View Profile</Link>
              </div>
            </div>
            <p className="text-gray-400 text-sm line-clamp-4">
              {song.artist_bio || "No biography available for this artist."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
