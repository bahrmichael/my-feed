import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { createTable, insertFeedItem } from "$lib/db-neon";
import { fetchAndParseFeed } from "$lib/feedParser";

// Secret token verification - should match your Vercel cron configuration
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET({ request }: RequestEvent) {
  // Verify the request is from Vercel cron
  const authHeader = request.headers.get("authorization");
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    authHeader.split(" ")[1] !== CRON_SECRET
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Ensure the table exists
    await createTable();

    // Fetch and parse the HN feed
    const feedUrl = "https://hnrss.org/newest?points=150";
    const feedItems = await fetchAndParseFeed(feedUrl);

    // Insert items into the database
    const results = [];
    for (const item of feedItems) {
      const result = await insertFeedItem(item);
      // Get the inserted ID from the returning clause
      const insertedId = result[0].id;
      results.push({ id: insertedId, title: item.title });
    }

    return json({
      success: true,
      message: `Processed ${results.length} feed items`,
      items: results,
    });
  } catch (error: any) {
    console.error("Error processing feed:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
