import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchUserPosts } from "@/lib/bluesky";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const since = url.searchParams.get("since");
    const until = url.searchParams.get("until");

    const posts = await fetchUserPosts(session, since || undefined, until || undefined);

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Fetch history failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
