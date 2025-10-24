// src/app/page.tsx
import { cookies } from "next/headers";
import SelectItemClient from "./_components/SelectItemClient";

export default async function Page() {
  const cookieStore = await cookies();
  const sess = cookieStore.get("sess");
  const authed = Boolean(sess);

  return <SelectItemClient authed={authed} />;
}