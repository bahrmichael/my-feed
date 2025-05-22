import { json } from "@sveltejs/kit";
import { getFeedItems } from "$lib/db";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET({ url }: RequestEvent) {
  try {
    const limit = Number(url.searchParams.get("limit") || "50");
    const offset = Number(url.searchParams.get("offset") || "0");

    const items = await getFeedItems(limit, offset);

    return json({
      success: true,
      items,
      limit,
      offset,
      total: items.length,
    });
  } catch (error: any) {
    console.error("Error fetching feed items:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
