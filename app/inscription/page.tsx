import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import InscriptionContent from "./InscriptionContent";

export default async function InscriptionPage() {
  const cours = await prisma.course.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <>
      <Navbar />
      <InscriptionContent cours={cours} />
    </>
  );
}