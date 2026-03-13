import React from 'react';
import { Link } from 'react-router-dom';
import { Song } from '../types';
import { Play, Eye } from 'lucide-react';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  return (
    <Link to={`/lyrics/${song.id}`} className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-yellow-400/50 transition-all duration-300">
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={song.cover_image || `https://picsum.photos/seed/${song.id}/400/400`} 
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white truncate group-hover:text-yellow-400 transition-colors">{song.title}</h3>
        <p className="text-gray-400 text-sm truncate">{song.artist_name}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Eye className="w-3 h-3" />
          <span>{song.views.toLocaleString()} views</span>
        </div>
      </div>
    </Link>
  );
};
