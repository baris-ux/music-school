"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export type CheckoutState = {
  error?: string;
};

export async function createOrder(
  eventId: string,
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const emailValue = formData.get("email");
  const quantityValue = formData.get("quantity");

  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const quantity = Number(quantityValue);

  if (!email || !email.includes("@")) {
    return { error: "Veuillez entrer une adresse e-mail valide." };
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { error: "La quantité doit être comprise entre 1 et 10." };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      price: true,
    },
  });

  if (!event) {
    return { error: "Cet événement est introuvable." };
  }

  const amount = event.price * quantity;

  let sessionUrl: string;

  try {
    const order = await prisma.order.create({
      data: {
        email,
        amount,
        status: "PENDING",
        eventId: event.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: event.title,
            },
            unit_amount: event.price
          },
          quantity,
        },
      ],

      success_url: `${process.env.APP_URL}/event/${event.id}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/event/${event.id}/checkout`,
      
      metadata: {
        orderId: order.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: session.id,
      },
    });

    if (!session.url) {
      return {
        error: "Impossible de créer la session de paiement.",
      };
    }

    sessionUrl = session.url;
  } catch (error) {

    console.error("Erreur inattendue lors de la création de la commande", error);

    return {
      error:
        "Une erreur est survenue pendant la création de la commande. Veuillez réessayer.",
    };
  }

  redirect(sessionUrl);
}