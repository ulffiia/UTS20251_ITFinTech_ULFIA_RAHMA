import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/cookies";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Hapus session cookie
    cookieStore.delete(SESSION_COOKIE);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}