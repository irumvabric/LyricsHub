export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'artist';
}

export interface Artist {
  id: number;
  user_id?: number;
  name: string;
  bio?: string;
  profile_image?: string;
  social_links?: string;
  created_at: string;
}

export interface Song {
  id: number;
  title: string;
  artist_id: number;
  artist_name?: string;
  album?: string;
  lyrics: string;
  youtube_link?: string;
  cover_image?: string;
  genre?: string;
  release_year?: number;
  views: number;
  status: 'pending' | 'approved';
  created_at: string;
}
