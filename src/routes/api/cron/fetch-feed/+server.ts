import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { createTable, insertFeedItem, getFeeds } from "$lib/db-neon";
import { fetchAndParseFeed } from "$lib/feedParser";

// Secret token verification - should match your Vercel cron configuration
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET({ request }: RequestEvent) {
  // Verify the request is from Vercel cron
  // const authHeader = request.headers.get("authorization");
  // if (
  //   !authHeader ||
  //   !authHeader.startsWith("Bearer ") ||
  //   authHeader.split(" ")[1] !== CRON_SECRET
  // ) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  try {
    // Ensure the tables exist
    await createTable();

    // Get all configured feeds
    const feeds = await getFeeds();

    const allResults = [];

    // Process each feed
    for (const feed of feeds) {
      console.log(`Processing feed: ${feed.name} (${feed.type})`);

      // Fetch and parse the feed based on its type
      const feedItems = await fetchAndParseFeed(
        feed.feed_url,
        feed.type,
        feed.name,
      );

      // Insert items into the database
      const feedResults = [];
      for (const item of feedItems) {
        const result = await insertFeedItem(item);
        // Get the inserted ID from the returning clause if available
        // If result[0] is undefined, it means the item already existed (ON CONFLICT DO NOTHING)
        if (result && result.length > 0) {
          const insertedId = result[0].id;
          feedResults.push({
            id: insertedId,
            title: item.title,
            source: item.source,
          });
        } else {
          // Item already existed in database
          console.log(`Skipping duplicate item: ${item.title}`);
        }
      }

      allResults.push({
        feed: feed.name,
        processed: feedResults.length,
        items: feedResults,
      });
    }

    return json({
      success: true,
      message: `Processed ${allResults.length} feeds`,
      results: allResults,
    });
  } catch (error: any) {
    console.error("Error processing feeds:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
