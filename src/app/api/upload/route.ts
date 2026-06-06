import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { uploadImageBuffer } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let buffer: Buffer;
  let mimeType = "image/jpeg";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { imageBase64?: string; mimeType?: string };
    if (!body.imageBase64) {
      return NextResponse.json({ error: "No image data" }, { status: 400 });
    }
    mimeType = body.mimeType?.startsWith("image/") ? body.mimeType : "image/jpeg";
    buffer = Buffer.from(body.imageBase64, "base64");
  } else {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const blob = file as File | Blob;
    mimeType =
      blob instanceof File && blob.type.startsWith("image/")
        ? blob.type
        : "image/jpeg";

    if (blob instanceof File && blob.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 8MB" }, { status: 400 });
    }

    buffer = Buffer.from(await blob.arrayBuffer());
  }

  if (buffer.byteLength > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 8MB" }, { status: 400 });
  }

  if (!mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  try {
    const url = await uploadImageBuffer(buffer);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Check Cloudinary env vars." },
      { status: 503 },
    );
  }
}
