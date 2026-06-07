import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { postImage } from "@/lib/bluesky";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const altText = (formData.get("altText") as string) || "";
    const tagsRaw = formData.get("tags") as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    await postImage(session, buffer, altText, tags);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Post failed:", err);
    return NextResponse.json(
      { error: "Failed to post. Check Bluesky connection." },
      { status: 500 }
    );
  }
}
