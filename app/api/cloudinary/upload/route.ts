import { NextResponse } from "next/server";
import { uploadImageBuffer, uploadImageFromUrl } from "@/lib/cloudinary/upload";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserCloudinaryFolder } from "@/lib/cloudinary/user-folder";
import { isSafePublicUrl, sanitizeErrorMessage } from "@/lib/security/sanitize";

export async function POST(request: Request) {
  try {
    // 1. Mandatory authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to upload media.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Resolve user's isolated Cloudinary directory (e.g. postgram/users/ig_jay_gurudeventerprises)
    const urlObj = new URL(request.url);
    const customUsername = urlObj.searchParams.get("username") || urlObj.searchParams.get("igUserId");
    const userFolderInfo = await getUserCloudinaryFolder(user, customUsername);

    const contentType = request.headers.get("content-type") || "";

    // 3. JSON payload with URL
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url } = body;
      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "Missing image URL in request body." }, { status: 400 });
      }

      if (!isSafePublicUrl(url)) {
        return NextResponse.json(
          { error: "Invalid or restricted image URL. Only public HTTPS image URLs are permitted." },
          { status: 400 }
        );
      }

      const result = await uploadImageFromUrl(url, userFolderInfo.folder);
      return NextResponse.json({
        success: true,
        asset: result,
        folder: userFolderInfo.folder,
      });
    }

    // 4. Multipart form data with file uploads
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No image files provided for upload." }, { status: 400 });
    }

    const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for video/reels
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg", "video/mp4", "video/quicktime"];

    const uploadedAssets = [];
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum allowed size of 50MB.` },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `File "${file.name}" has an unsupported format (${file.type}). Supported formats: JPG, PNG, WEBP, MP4, MOV.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadImageBuffer(buffer, userFolderInfo.folder);
      uploadedAssets.push(result);
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      count: uploadedAssets.length,
      folder: userFolderInfo.folder,
      userIdentifier: userFolderInfo.userIdentifier,
    });
  } catch (err: any) {
    console.error("Cloudinary upload API error:", err);
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to upload media to Cloudinary.") },
      { status: 500 }
    );
  }
}
