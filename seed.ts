import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('lyricshub.db');

async function seed() {
  console.log('🌱 Seeding database...');

  // Set up admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin User', 'admin@lyricshub.com', adminPassword, 'admin');

  const artists = [
    {
      name: 'The Midnight Echo',
      email: 'echo@example.com',
      bio: 'Celestial soundscapes blending synthwave with modern rock.',
      image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop',
      songs: [
        {
          title: 'Neon Horizon',
          album: 'Starlight Voyage',
          lyrics: `(Verse 1)\nDrifting through the digital haze\nSearching for the light in endless days\nElectric pulse, a neon stream\nLiving inside a silicon dream\n\n(Chorus)\nOh, we're chasing the neon horizon\nWhere the stars and the circuits collide\nIn the glow of the world we're revising\nThere’s nowhere left for us to hide`,
          genre: 'Synthwave',
          year: 2024,
          cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop',
          views: 1250,
        },
        {
          title: 'Stardust Memories',
          album: 'Starlight Voyage',
          lyrics: `(Verse 1)\nSilence echoes in the void between\nWhispers of things that we've never seen\nA cosmic dance on a frozen sea\nUnlock the truth and set us free\n\n(Chorus)\nStardust memories in your eyes\nBeneath the cold and velvet skies\nEvery heartbeat, a distant sun\nThe journey’s only just begun`,
          genre: 'Rock',
          year: 2024,
          cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
          views: 840,
        }
      ]
    },
    {
      name: 'Luna Vane',
      email: 'luna@example.com',
      bio: 'Soulful melodies and poetic lyrics that explore the depths of human emotion.',
      image: 'https://images.unsplash.com/photo-1516726817505-f5ed17cb77f2?q=80&w=2070&auto=format&fit=crop',
      songs: [
        {
          title: 'Midnight Serenade',
          album: 'Reflections',
          lyrics: `(Verse 1)\nMoonlight spills across the floor\nI can't take this anymore\nThe weight of secrets, heavy and deep\nPromises that we couldn't keep\n\n(Chorus)\nSing me a midnight serenade\nBefore the morning light starts to fade\nLet the hollow echoes carry our song\nWhere we belong, where we belong`,
          genre: 'Soul',
          year: 2023,
          cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
          views: 3100,
        },
        {
          title: 'Paper Hearts',
          album: 'Simple Things',
          lyrics: `(Verse 1)\nFolding edges, sharp and fine\nTracing every crooked line\nA fragile shell, a hollow beat\nWalking down this empty street\n\n(Chorus)\nPaper hearts in a summer rain\nTrying to wash away the pain\nTear it up and let it fly\nUnderneath the weeping sky`,
          genre: 'Indie Pop',
          year: 2025,
          cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop',
          views: 1560,
        }
      ]
    },
    {
      name: 'Durban Beats',
      email: 'beats@example.com',
      bio: 'Infusing traditional rhythms with urban energy.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
      songs: [
        {
          title: 'City Pulse',
          album: 'Street Life',
          lyrics: `(Verse 1)\nConcrete jungle, iron vines\nReading all the neon signs\nBass is thumping in my chest\nNo time for sleep, no time for rest\n\n(Chorus)\nFeel the city pulse tonight\nEverything's gonna be alright\nFrom the alley to the square\nThere's magic in the electric air`,
          genre: 'Hip Hop',
          year: 2024,
          cover: 'https://images.unsplash.com/photo-1493238792000-811347007739?q=80&w=2070&auto=format&fit=crop',
          views: 5200,
        }
      ]
    }
  ];

  for (const artist of artists) {
    const password = await bcrypt.hash('password123', 10);
    
    // Create user
    const userResult = db.prepare(`
      INSERT OR IGNORE INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(artist.name, artist.email, password, 'artist');

    let userId: any;
    if (userResult.lastInsertRowid === 0n) {
      // User already exists, fetch id
      userId = (db.prepare('SELECT id FROM users WHERE email = ?').get(artist.email) as any).id;
    } else {
      userId = userResult.lastInsertRowid;
    }

    // Create artist profile
    const artistResult = db.prepare(`
      INSERT OR IGNORE INTO artists (user_id, name, bio, profile_image)
      VALUES (?, ?, ?, ?)
    `).run(userId, artist.name, artist.bio, artist.image);

    let artistId: any;
    if (artistResult.lastInsertRowid === 0n) {
      artistId = (db.prepare('SELECT id FROM artists WHERE user_id = ?').get(userId) as any).id;
    } else {
      artistId = artistResult.lastInsertRowid;
    }

    // Add songs
    for (const song of artist.songs) {
      db.prepare(`
        INSERT OR IGNORE INTO songs (title, artist_id, lyrics, album, cover_image, genre, release_year, views, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')
      `).run(song.title, artistId, song.lyrics, song.album, song.cover, song.genre, song.year, song.views);
    }
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
