import { json } from "@sveltejs/kit";
import { batchCheckBookmarks } from "$lib/db-neon";
import type { RequestEvent } from "@sveltejs/kit";

// Get bookmark status for multiple items
export async function POST({ request }: RequestEvent) {
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return json({ success: false, error: "Invalid or empty IDs array" }, { status: 400 });
    }
    
    // Convert any string IDs to numbers
    const numericIds = ids.map(id => Number(id));
    
    // Get bookmark statuses in a single database query
    const bookmarkMap = await batchCheckBookmarks(numericIds);
    
    return json({
      success: true,
      bookmarks: bookmarkMap
    });
  } catch (error: any) {
    console.error("Error checking batch bookmark status:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}