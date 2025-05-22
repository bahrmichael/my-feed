import { json } from "@sveltejs/kit";
import { markAsSeen } from "$lib/db-neon";
import type { RequestEvent } from "@sveltejs/kit";

// Mark as seen
export async function POST({ params }: RequestEvent) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    
    const result = await markAsSeen(id);
    
    return json({
      success: true,
      message: "Item marked as seen",
      id: result?.id
    });
  } catch (error: any) {
    console.error("Error marking item as seen:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}