import { neon } from '@neondatabase/serverless';
import 'dotenv/config'; // Load environment variables

// Get the database connection string
const connectionString = process.env.DATABASE_URL || '';

// Create the SQL client
export const sql = neon(connectionString);

// Create a test function to verify connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW();`;
    console.log('Neon database connected successfully', result[0]);
    return true;
  } catch (error) {
    console.error('Failed to connect to Neon database:', error);
    return false;
  }
}

// Database operations
export async function createTable() {
  try {
    // Create feed items table
    await sql`
      CREATE TABLE IF NOT EXISTS feed_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        link TEXT NOT NULL UNIQUE,
        pub_date TIMESTAMP NOT NULL,
        type TEXT DEFAULT 'article',
        source TEXT DEFAULT 'hn',
        image_url TEXT,
        seen BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Add seen column if it doesn't exist (for existing tables)
    try {
      await sql`ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS seen BOOLEAN DEFAULT FALSE;`;
    } catch (error) {
      console.error('Error adding seen column:', error);
    }
    
    // Create feeds configuration table
    await sql`
      CREATE TABLE IF NOT EXISTS feeds (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        feed_url TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create bookmarks table with foreign key reference to feed_items
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        feed_item_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feed_item_id) REFERENCES feed_items(id) ON DELETE CASCADE,
        UNIQUE(feed_item_id)
      );
    `;
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export async function insertFeedItem(item: {
  title: string;
  link: string;
  pubDate: Date;
  type?: string;
  source?: string;
  imageUrl?: string;
}) {
  try {
    // Convert Date to ISO string for Postgres compatibility
    const pubDateStr = item.pubDate.toISOString();
    
    const result = await sql`
      INSERT INTO feed_items (title, link, pub_date, type, source, image_url)
      VALUES (${item.title}, ${item.link}, ${pubDateStr}, ${item.type || 'article'}, ${item.source || 'hn'}, ${item.imageUrl || null})
      ON CONFLICT (link) DO NOTHING
      RETURNING id
    `;
    return result;
  } catch (error) {
    console.error('Error inserting feed item:', error);
    throw error;
  }
}

export async function getFeedItems(limit = 50, offset = 0, type?: string) {
  try {
    let result;
    if (type) {
      result = await sql`
        SELECT id, title, link, pub_date, type, source, image_url, seen, created_at FROM feed_items 
        WHERE type = ${type}
        ORDER BY pub_date DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      result = await sql`
        SELECT id, title, link, pub_date, type, source, image_url, seen, created_at FROM feed_items 
        ORDER BY pub_date DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return result;
  } catch (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }
}

// Feed configuration functions
export async function insertFeed(feed: {
  name: string;
  feed_url: string;
  type: string;
}) {
  try {
    const result = await sql`
      INSERT INTO feeds (name, feed_url, type)
      VALUES (${feed.name}, ${feed.feed_url}, ${feed.type})
      ON CONFLICT (feed_url) DO NOTHING
      RETURNING id
    `;
    return result;
  } catch (error) {
    console.error('Error inserting feed:', error);
    throw error;
  }
}

export async function getFeeds() {
  try {
    const result = await sql`
      SELECT * FROM feeds
      ORDER BY id ASC
    `;
    return result;
  } catch (error) {
    console.error('Error fetching feeds:', error);
    throw error;
  }
}

export async function getFeedById(id: number) {
  try {
    const result = await sql`
      SELECT * FROM feeds
      WHERE id = ${id}
    `;
    return result[0];
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
}

// Bookmark operations
export async function addBookmark(feedItemId: number) {
  try {
    const result = await sql`
      INSERT INTO bookmarks (feed_item_id)
      VALUES (${feedItemId})
      ON CONFLICT (feed_item_id) DO NOTHING
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
}

export async function removeBookmark(feedItemId: number) {
  try {
    const result = await sql`
      DELETE FROM bookmarks
      WHERE feed_item_id = ${feedItemId}
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
}

export async function getBookmarks(limit = 50, offset = 0) {
  try {
    const result = await sql`
      SELECT f.id, f.title, f.link, f.pub_date, f.type, f.source, f.image_url, f.seen, f.created_at
      FROM feed_items f
      JOIN bookmarks b ON f.id = b.feed_item_id
      ORDER BY b.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
}

export async function isBookmarked(feedItemId: number) {
  try {
    const result = await sql`
      SELECT id FROM bookmarks
      WHERE feed_item_id = ${feedItemId}
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    throw error;
  }
}

export async function batchCheckBookmarks(feedItemIds: number[]) {
  try {
    if (feedItemIds.length === 0) return {};
    
    // Convert array to postgres array using unnest
    const result = await sql`
      SELECT feed_item_id FROM bookmarks
      WHERE feed_item_id = ANY(${feedItemIds})
    `;
    
    // Create a map of id -> bookmarked status
    const bookmarkMap: Record<number, boolean> = {};
    
    // Initialize all requested IDs as false (not bookmarked)
    feedItemIds.forEach(id => {
      bookmarkMap[id] = false;
    });
    
    // Set bookmarked items to true
    result.forEach((row: { feed_item_id: number }) => {
      bookmarkMap[row.feed_item_id] = true;
    });
    
    return bookmarkMap;
  } catch (error) {
    console.error('Error batch checking bookmark status:', error);
    throw error;
  }
}

// Seen status operations
export async function markAsSeen(feedItemId: number) {
  try {
    const result = await sql`
      UPDATE feed_items
      SET seen = TRUE
      WHERE id = ${feedItemId}
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error('Error marking item as seen:', error);
    throw error;
  }
}

