import paypal from "@paypal/paypal-server-sdk";

const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PAYPAL_MODE,
} = process.env;

const environment =
    PAYPAL_MODE === "live"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment;

const client = new paypal.core.PayPalHttpClient(
    new environment(
        PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET
    )
);

export default client;