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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
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
}) {
  try {
    // Convert Date to ISO string for Postgres compatibility
    const pubDateStr = item.pubDate.toISOString();
    
    const result = await sql`
      INSERT INTO feed_items (title, link, pub_date, type, source)
      VALUES (${item.title}, ${item.link}, ${pubDateStr}, ${item.type || 'article'}, ${item.source || 'hn'})
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
        SELECT * FROM feed_items 
        WHERE type = ${type}
        ORDER BY pub_date DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      result = await sql`
        SELECT * FROM feed_items 
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