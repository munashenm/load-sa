import { createHash } from "crypto";

export type PayFastConfig = {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  sandbox: boolean;
  appUrl: string;
};

export function getPayFastConfig(): PayFastConfig | null {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;

  if (!merchantId || !merchantKey || !appUrl) {
    return null;
  }

  return {
    merchantId,
    merchantKey,
    passphrase: process.env.PAYFAST_PASSPHRASE ?? "",
    sandbox: process.env.PAYFAST_SANDBOX !== "false",
    appUrl: appUrl.replace(/\/$/, ""),
  };
}

export function payfastProcessUrl(sandbox: boolean): string {
  return sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

/** PayFast parameter order for signature (exclude signature, empty values). */
function encodeValue(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

export function generatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string,
): string {
  const keys = Object.keys(data)
    .filter((k) => k !== "signature" && data[k] !== "")
    .sort();

  const query = keys.map((k) => `${k}=${encodeValue(data[k])}`).join("&");
  const withPass =
    passphrase && passphrase.length > 0
      ? `${query}&passphrase=${encodeValue(passphrase)}`
      : query;

  return createHash("md5").update(withPass).digest("hex");
}

export function buildPayFastPaymentFields(input: {
  bookingId: string;
  reference: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  itemName: string;
}): { action: string; fields: Record<string, string> } | null {
  const config = getPayFastConfig();
  if (!config) return null;

  const amount = input.amount.toFixed(2);

  const fields: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${config.appUrl}/pay/return?booking=${input.bookingId}`,
    cancel_url: `${config.appUrl}/pay/cancel?booking=${input.bookingId}`,
    notify_url: `${config.appUrl}/api/payfast/notify`,
    email_address: input.customerEmail,
    name_first: input.customerName.split(" ")[0] ?? "Customer",
    name_last: input.customerName.split(" ").slice(1).join(" ") || "LoadSA",
    m_payment_id: input.reference,
    amount,
    item_name: input.itemName,
    custom_str1: input.bookingId,
  };

  fields.signature = generatePayFastSignature(fields, config.passphrase);

  return {
    action: payfastProcessUrl(config.sandbox),
    fields,
  };
}

/** Verify ITN payload from PayFast */
export function verifyPayFastItn(
  data: Record<string, string>,
  receivedSignature: string,
): boolean {
  const config = getPayFastConfig();
  if (!config) return false;

  const copy = { ...data };
  delete copy.signature;
  const expected = generatePayFastSignature(copy, config.passphrase);
  return expected === receivedSignature;
}
