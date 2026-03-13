import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Song } from '../types';
import { SongCard } from '../components/SongCard';
import { Search as SearchIcon } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/songs?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchResults();
  }, [query]);

  return (
    <div className="py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-yellow-400" />
          Search Results
        </h1>
        <p className="text-gray-400 mt-2">Showing results for "{query}"</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-yellow-400">Searching...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map(song => <SongCard key={song.id} song={song} />)}
          </div>
          {results.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">No results found for your search.</p>
              <p className="text-gray-600 mt-2">Try searching for a different song title or artist.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
