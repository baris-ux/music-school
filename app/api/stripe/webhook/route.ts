import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { randomUUID  } from "crypto";
import { resend } from "@/lib/email";
import { generateTicketPdf } from "@/lib/ticket-pdf";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Signature Stripe manquante." },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Erreur de signature webhook Stripe", error);

    return NextResponse.json(
      { error: "Signature webhook invalide." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("orderId absent dans les metadata Stripe");

        return NextResponse.json(
          { error: "orderId absent des metadata." },
          { status: 400 }
        );
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          tickets: true,
          event : true
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Commande introuvable." },
          { status: 404 }
        );
      }

      if (order.status === "PAID" && order.tickets.length > 0) {
        console.log("Commande déjà traitée, ignorée", { orderId });
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const createdTicket = await prisma.$transaction(async (tx) => {
        if (order.status !== "PAID") {
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
            },
          });
        }

        if (order.tickets.length === 0) {
          return tx.ticket.create({
            data: {
              qrCode: randomUUID(),
              orderId: order.id,
              eventId: order.eventId,
            },
          });
        }

        return null;
      });

      if (createdTicket) {
        const pdfBytes = await generateTicketPdf({
          qrCode: createdTicket.qrCode,
          eventTitle: order.event.title,
          buyerEmail: order.email,
        });

        if (!resend) {
          throw new Error("RESEND_API_KEY manquante.");
        }

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: order.email,
          subject: "Votre billet 🎟️",
          html: `
            <h1>Merci pour votre achat</h1>
            <p>Votre paiement a bien été confirmé.</p>
            <p>Voici votre billet :</p>
            <p>Votre billet est en pièce jointe (PDF).</p>
          `,
          attachments: [
            {
              filename: "ticket.pdf",
              content: Buffer.from(pdfBytes).toString("base64"),
            },
          ],
        });
      }

      console.log("Commande marquée PAID et ticket créé", { orderId });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur inattendue lors du traitement webhook Stripe", error);

    return NextResponse.json(
      { error: "Erreur pendant le traitement du webhook." },
      { status: 500 }
    );
  }
}