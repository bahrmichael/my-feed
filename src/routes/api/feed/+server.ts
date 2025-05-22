import { json } from "@sveltejs/kit";
import { getFeedItems } from "$lib/db";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET({ url }: RequestEvent) {
  try {
    const limit = Number(url.searchParams.get("limit") || "5");
    const offset = Number(url.searchParams.get("offset") || "0");
    const type = url.searchParams.get("type") || undefined;

    const items = await getFeedItems(limit, offset, type);

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
