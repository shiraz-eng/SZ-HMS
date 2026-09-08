import { NextResponse } from "next/server";
import { getPaymentProvider } from "@szhms/payments";
import { prisma } from "@szhms/database";
import { activateSubscription } from "@szhms/database/provisioning";

// Stripe needs the raw, unparsed body to verify the signature.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = await getPaymentProvider("stripe").parseWebhook(payload, signature);
  } catch (err) {
    console.error("[stripe] webhook verification failed:", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.completed":
        await activateSubscription({
          tenantId: event.tenantId,
          externalCustomerId: event.externalCustomerId,
          externalSubscriptionId: event.externalSubscriptionId,
          currentPeriodEnd: event.currentPeriodEnd,
        });
        break;

      case "subscription.past_due":
        await prisma.subscription.updateMany({
          where: { externalSubscriptionId: event.externalSubscriptionId },
          data: { status: "PAST_DUE" },
        });
        break;

      case "subscription.canceled":
        await prisma.subscription.updateMany({
          where: { externalSubscriptionId: event.externalSubscriptionId },
          data: { status: "CANCELED" },
        });
        break;

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe] webhook handler error:", err);
    return new NextResponse("handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
