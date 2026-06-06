import crypto from "crypto";

const PAYSTACK_API = "https://api.paystack.co";

export type PaystackInitResult = {
  authorizationUrl: string;
  reference: string;
};

export type PaystackInitError = {
  error: string;
};

export type PaystackVerification = {
  status: "success" | "failed" | "pending";
  amount: number;
  providerRef: string;
  bookingId?: string;
};

function getSecretKey(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || undefined;
}

function getAppUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function isPaystackConfigured(): boolean {
  return Boolean(getSecretKey() && getAppUrl());
}

function zarToSubunits(amount: number): number {
  return Math.round(amount * 100);
}

function subunitsToZar(amount: number): number {
  return amount / 100;
}

function paystackReference(bookingId: string): string {
  return `fm_${bookingId}_${Date.now()}`;
}

type PaystackFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function paystackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<PaystackFetchResult<T>> {
  const secret = getSecretKey();
  if (!secret) {
    return { ok: false, message: "Paystack secret key is not configured." };
  }

  const res = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await res.text().catch(() => "");

  if (!res.ok) {
    let message = `Paystack request failed (${res.status}).`;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      /* use default */
    }
    console.error("[paystack]", path, res.status, body);
    return { ok: false, message };
  }

  return { ok: true, data: JSON.parse(body) as T };
}

type InitializeResponse = {
  status: boolean;
  data?: {
    authorization_url: string;
    reference: string;
  };
};

type VerifyResponse = {
  status: boolean;
  data?: {
    status: string;
    reference: string;
    amount: number;
    metadata?: { booking_id?: string };
  };
};

export async function initializePaystackTransaction(input: {
  bookingId: string;
  reference: string;
  amount: number;
  customerEmail: string;
  itemName: string;
}): Promise<PaystackInitResult | PaystackInitError> {
  const appUrl = getAppUrl();
  if (!appUrl) {
    return { error: "NEXT_PUBLIC_APP_URL is not set on the server." };
  }

  const reference = paystackReference(input.bookingId);

  const result = await paystackFetch<InitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.customerEmail,
      amount: zarToSubunits(input.amount),
      currency: "ZAR",
      reference,
      callback_url: `${appUrl}/pay/return?booking=${input.bookingId}`,
      metadata: {
        booking_id: input.bookingId,
        booking_reference: input.reference,
        item_name: input.itemName,
      },
    }),
  });

  if (!result.ok) return { error: result.message };

  const json = result.data;
  if (!json.status || !json.data?.authorization_url) {
    return { error: "Paystack did not return a checkout URL." };
  }

  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
  };
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerification | null> {
  const result = await paystackFetch<VerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );

  if (!result.ok || !result.data.data) return null;

  const json = result.data;

  const status =
    json.data.status === "success"
      ? "success"
      : json.data.status === "failed"
        ? "failed"
        : "pending";

  return {
    status,
    amount: subunitsToZar(json.data.amount),
    providerRef: json.data.reference,
    bookingId: json.data.metadata?.booking_id,
  };
}

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = getSecretKey();
  if (!secret || !signature) return false;

  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (hash.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
