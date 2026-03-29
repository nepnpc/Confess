import { getApprovedConfessions } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const confessions = await getApprovedConfessions();
  return <HomeClient confessions={confessions} />;
}
