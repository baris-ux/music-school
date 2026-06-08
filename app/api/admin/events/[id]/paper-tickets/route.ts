import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generatePaperTicketsBatchPdf } from "@/lib/ticket-pdf";
import { randomUUID } from "crypto";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: eventId } = await params;
  const body = await request.json();
  const quantity = Number(body?.quantity);

  if (!quantity || quantity < 1 || quantity > 500) {
    return NextResponse.json({ error: "Quantité invalide (1–500)" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { tickets: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  const remaining = event.capacity - event._count.tickets;
  if (quantity > remaining) {
    return NextResponse.json(
      { error: `Capacité insuffisante. Places restantes : ${remaining}` },
      { status: 400 }
    );
  }

  const qrCodes = Array.from({ length: quantity }, () => randomUUID());

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        email: "billetterie-papier@ecole.be",
        amount: event.price * quantity,
        status: "PAPER",
        eventId: event.id,
      },
    });

    await tx.ticket.createMany({
      data: qrCodes.map((qrCode) => ({
        qrCode,
        isPaperTicket: true,
        orderId: order.id,
        eventId: event.id,
      })),
    });
  });

  const eventDate = new Date(event.startAt).toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const pdfBytes = await generatePaperTicketsBatchPdf({
    qrCodes,
    eventTitle: event.title,
    eventDate,
    eventLocation: event.location,
    eventPrice: event.price,
  });

  const safeName = event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="billets-papier-${safeName}.pdf"`,
    },
  });
}
