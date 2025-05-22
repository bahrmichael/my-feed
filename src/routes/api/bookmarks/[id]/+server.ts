import { json } from "@sveltejs/kit";
import { addBookmark, removeBookmark, isBookmarked } from "$lib/db-neon";
import type { RequestEvent } from "@sveltejs/kit";

// Get bookmark status
export async function GET({ params }: RequestEvent) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    
    const bookmarked = await isBookmarked(id);
    
    return json({
      success: true,
      bookmarked
    });
  } catch (error: any) {
    console.error("Error checking bookmark status:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// Add a bookmark
export async function POST({ params }: RequestEvent) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    
    const result = await addBookmark(id);
    
    return json({
      success: true,
      message: "Bookmark added",
      id: result?.id
    });
  } catch (error: any) {
    console.error("Error adding bookmark:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// Remove a bookmark
export async function DELETE({ params }: RequestEvent) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    
    const result = await removeBookmark(id);
    
    return json({
      success: true,
      message: "Bookmark removed",
      id: result?.id
    });
  } catch (error: any) {
    console.error("Error removing bookmark:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}