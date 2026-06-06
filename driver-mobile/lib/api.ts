import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const TOKEN_KEY = "fluxmove_token";
const LEGACY_TOKEN_KEY = "loadsa_token";

export async function getToken() {
  return (
    (await SecureStore.getItemAsync(TOKEN_KEY)) ??
    (await SecureStore.getItemAsync(LEGACY_TOKEN_KEY))
  );
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}

export async function mobileLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/mobile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  await setToken(data.token);
  return data;
}

/** Upload a local image URI to Cloudinary via the web API. */
export async function uploadImageUri(uri: string): Promise<string> {
  const token = await getToken();
  if (!token) throw new Error("Not signed in");

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const ext = uri.split(".").pop()?.toLowerCase();
  const mimeType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed");
  }
  return data.url as string;
}
