import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

// Helper untuk parsing error agar tetap type-safe
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const conn = await connectDB();

    // Ping database untuk memastikan koneksi aktif
    const admin = conn.connection.getClient().db().admin();
    const ping = await admin.ping();

    res.status(200).json({
      connected: conn.connection.readyState === 1, // 1 = connected
      readyState: conn.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
      ping,
    });
  } catch (e: unknown) {
    const msg = getErrorMessage(e);
    console.error("DBCHECK ERROR:", msg);
    res.status(500).json({
      error: msg,
      name: e instanceof Error ? e.name : "UnknownError",
    });
  }
}
