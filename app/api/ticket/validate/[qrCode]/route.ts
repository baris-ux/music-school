import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


type RouteContext = {
  params: Promise<{
    qrCode: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { qrCode } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        order: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message: "Billet introuvable.",
        },
        { status: 404 }
      );
    }

    if (ticket.usedAt) {
      return NextResponse.json(
        {
          success: false,
          status: "ALREADY_USED",
          message: "Ce billet a déjà été utilisé.",
          ticket: {
            id: ticket.id,
            qrCode: ticket.qrCode,
            usedAt: ticket.usedAt,
            event: ticket.event
              ? {
                  id: ticket.event.id,
                  title: ticket.event.title,
                }
              : null,
            order: ticket.order
              ? {
                  email: ticket.order.email,
                }
              : null,
          },
        },
        { status: 409 }
      );
    }

    const updatedTicket = await prisma.ticket.update({
      where: { qrCode },
      data: {
        usedAt: new Date(),
      },
      include: {
        event: true,
        order: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        status: "VALID",
        message: "Billet valide. Entrée autorisée.",
        ticket: {
          id: updatedTicket.id,
          qrCode: updatedTicket.qrCode,
          usedAt: updatedTicket.usedAt,
          event: updatedTicket.event
            ? {
                id: updatedTicket.event.id,
                title: updatedTicket.event.title,
              }
            : null,
          order: updatedTicket.order
            ? {
                email: updatedTicket.order.email,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur inattendue lors de la validation du billet", error);

    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        message: "Erreur serveur pendant la validation du billet.",
      },
      { status: 500 }
    );
  }
}