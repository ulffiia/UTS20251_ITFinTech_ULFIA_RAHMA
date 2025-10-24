import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SelectItemClient from "./_components/SelectItemClient";

export default async function Page() {
  const cookieStore = await cookies(); // ✅ harus pakai await
  const sess = cookieStore.get("sess");

  if (!sess) {
    redirect("/login");
  }

  return <SelectItemClient />;
}
