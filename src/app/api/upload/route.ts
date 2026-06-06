import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth-request";
import { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";

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

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Photo uploads are not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Railway, then redeploy. You can skip the photo and continue booking.",
      },
      { status: 503 },
    );
  }

  try {
    const url = await uploadImageBuffer(buffer);
    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Cloudinary upload failed";
    console.error("[upload]", message);
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 503 },
    );
  }
}
