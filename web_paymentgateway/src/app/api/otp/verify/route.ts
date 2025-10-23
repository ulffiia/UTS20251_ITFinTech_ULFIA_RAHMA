import { NextResponse } from "next/server";
import { connectDB, OtpModel } from "@/lib/mongodb";
import { setSessionCookie } from "@/lib/cookies";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { code, tempToken } = await req.json();
    
    console.log("🔍 [VERIFY] Code:", code);
    console.log("🔍 [VERIFY] Token exists:", !!tempToken);

    if (!code || !tempToken) {
      return NextResponse.json({ error: "Code & tempToken required" }, { status: 400 });
    }

    // Verify temp token
    let payload: any;
    try {
      payload = jwt.verify(tempToken, process.env.JWT_SECRET!);
      console.log("✅ [VERIFY] Token valid, phone:", payload.phone);
      
      if (payload.purpose !== "mfa") {
        throw new Error("Invalid purpose");
      }
    } catch (err) {
      console.error("❌ [VERIFY] Token invalid:", err);
      return NextResponse.json({ error: "Temp token invalid/expired" }, { status: 401 });
    }

    // Check OTP in database
    await connectDB();
    const found = await OtpModel.findOne({
      phone: payload.phone,
      code,
      expiresAt: { $gt: new Date() },
    });

    console.log("🔎 [VERIFY] OTP found in DB:", !!found);

    if (!found) {
      return NextResponse.json({ error: "OTP salah atau kedaluwarsa" }, { status: 400 });
    }

    // Delete used OTP
    await OtpModel.deleteMany({ phone: payload.phone });
    console.log("🗑️ [VERIFY] OTP deleted");

    // Create session token (7 days)
    const session = jwt.sign(
      { sub: payload.sub, phone: payload.phone }, 
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("🎫 [VERIFY] Session created");

    // Set cookie using helper function
    setSessionCookie(session);

    console.log("✅ [VERIFY] Login successful, redirecting to /");

    // Return JSON response instead of redirect for client-side handling
    return NextResponse.json({ 
      success: true, 
      redirectTo: "/" 
    });

  } catch (e: any) {
    console.error("💥 [VERIFY] Error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}