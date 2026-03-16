import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16" as any,
    typescript: true,
});

export const getStripeSession = async ({
    userId,
    userEmail,
    priceId,
}: {
    userId: string;
    userEmail: string;
    priceId: string;
}) => {
    // Mocking the checkout session for now
    // In a real implementation, you'd call stripe.checkout.sessions.create
    return {
        url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
        id: "mock-session-id",
    };
};
