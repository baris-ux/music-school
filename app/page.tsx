import { prisma } from "@/lib/prisma";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeContent from "./components/HomeContent";

export default async function HomePage() {
  const upcomingEvents = await prisma.event.findMany({
    where: { startAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
    take: 3,
  });

  return (
    <>
      <Navbar />
      <HomeContent upcomingEvents={upcomingEvents} />
      <Footer />
    </>
  );
}