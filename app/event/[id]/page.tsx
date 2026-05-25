import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventDetailContent from "./EventDetailContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      startAt: true,
      price: true,
    },
  });

  if (!event) notFound();

  return <EventDetailContent event={event} />;
}