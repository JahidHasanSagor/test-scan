import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_TEST_KEY || process.env.STRIPE_LIVE_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quantity, successUrl, cancelUrl } = body;

    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Calculate total amount in cents
    const pricePerUnit = 1900; // $19.00 in cents
    const totalAmount = pricePerUnit * quantity;

    // Create Stripe checkout session with explicit line item
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Tool Submission",
              description: `${quantity} tool submission${quantity > 1 ? "s" : ""}`,
            },
            unit_amount: pricePerUnit, // Price per unit in cents
          },
          quantity: quantity, // Number of units
        },
      ],
      mode: "payment",
      success_url: successUrl || `${req.headers.get("origin")}/pricing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing?canceled=true`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        productId: "pay-per-tool",
        quantity: quantity.toString(),
        totalAmount: totalAmount.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}