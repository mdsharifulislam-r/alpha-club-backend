import Stripe from "stripe";
import config from ".";

// Assume stripe config is nested under config and fallback to ''
const secretKey = (config as any)?.stripe?.secret_key as string | undefined;

if (!secretKey) {
    throw new Error("Stripe secret key is not defined in config.stripe.secret_key");
}

const stripe = new Stripe(secretKey, {
    typescript: true,
});

    export default stripe;