import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import EventsContent from "./EventsContent";

export const dynamic = "force-dynamic";

export default async function EventsPublicPage() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
  });

  return (
    <>
      <Navbar />
      <EventsContent events={events} />
    </>
  );
}