import { sql } from '@vercel/postgres';

export async function createTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS feed_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        pub_date TIMESTAMP NOT NULL,
        description TEXT,
        content TEXT,
        author TEXT,
        points INTEGER,
        comments_count INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

export async function insertFeedItem(item: {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  description?: string;
  content?: string;
  author?: string;
  points?: number;
  commentsCount?: number;
}) {
  try {
    // Convert Date to ISO string for Postgres compatibility
    const pubDateStr = item.pubDate.toISOString();
    
    await sql`
      INSERT INTO feed_items (id, title, link, pub_date, description, content, author, points, comments_count)
      VALUES (${item.id}, ${item.title}, ${item.link}, ${pubDateStr}, ${item.description || null}, 
              ${item.content || null}, ${item.author || null}, ${item.points || 0}, ${item.commentsCount || 0})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        link = EXCLUDED.link,
        pub_date = EXCLUDED.pub_date,
        description = EXCLUDED.description,
        content = EXCLUDED.content,
        author = EXCLUDED.author,
        points = EXCLUDED.points,
        comments_count = EXCLUDED.comments_count
    `;
  } catch (error) {
    console.error('Error inserting feed item:', error);
    throw error;
  }
}

export async function getFeedItems(limit = 50, offset = 0) {
  try {
    const result = await sql`
      SELECT * FROM feed_items 
      ORDER BY pub_date DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }
}