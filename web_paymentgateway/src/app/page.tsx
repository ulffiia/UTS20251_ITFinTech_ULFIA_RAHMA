import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SelectItemClient from "./_components/SelectItemClient";

export default async function Page() {
  const c = await cookies(); // Ambil cookies
  const sess = c.get("sess"); // Ambil cookie bernama "sess"

  if (!sess) {
    // Jika belum login
    redirect("/login");
  }

  // Jika sudah login
  return <SelectItemClient />;
}
