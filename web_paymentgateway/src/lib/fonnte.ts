export async function sendWhatsapp(target: string, message: string) {
  const token = process.env.FONNTE_TOKEN;

  console.log("🔧 [FONNTE] Token exists:", !!token);
  console.log("🔧 [FONNTE] Token length:", token?.length || 0);
  console.log("🔧 [FONNTE] Target:", target);
  console.log("🔧 [FONNTE] Message:", message);

  if (!token) {
    console.error("❌ [FONNTE] FONNTE_TOKEN missing in .env");
    throw new Error("FONNTE_TOKEN missing");
  }

  const body = new FormData();
  body.append("target", target);
  body.append("message", message);

  console.log("📤 [FONNTE] Sending request to Fonnte API...");

  try {
    const resp = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token, // Fonnte format: langsung token tanpa Bearer
      },
      body,
    });

    const responseText = await resp.text();
    console.log("📥 [FONNTE] Response status:", resp.status);
    console.log("📥 [FONNTE] Response body:", responseText);

    if (!resp.ok) {
      throw new Error(`Fonnte error: ${resp.status} ${responseText}`);
    }

    // Jika API Fonnte selalu mengembalikan JSON
    return JSON.parse(responseText) as Record<string, unknown>;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("💥 [FONNTE] Fatal error:", error.message);
      throw new Error(error.message);
    } else {
      console.error("💥 [FONNTE] Unknown error:", error);
      throw new Error("Unknown error while sending WhatsApp message");
    }
  }
}
