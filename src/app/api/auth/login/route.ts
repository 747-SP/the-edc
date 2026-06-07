import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/bluesky";

export const runtime = "edge";
import { setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { did, password } = await req.json();

    if (!did || !password) {
      return NextResponse.json(
        { error: "DID and password are required" },
        { status: 400 }
      );
    }

    const session = await login(did, password);
    await setSession(session);

    return NextResponse.json({
      did: session.did,
      handle: session.handle,
    });
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: "Authentication failed. Check DID and password." },
      { status: 401 }
    );
  }
}
