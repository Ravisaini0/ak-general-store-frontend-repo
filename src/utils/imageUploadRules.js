const IMAGE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
const IMAGE_UPLOAD_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const IMAGE_UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${Number(mb.toFixed(mb >= 10 ? 0 : 1))} MB`;
}

function getFileExtension(name = "") {
  const normalizedName = String(name || "").trim().toLowerCase();
  const dotIndex = normalizedName.lastIndexOf(".");
  return dotIndex >= 0 ? normalizedName.slice(dotIndex) : "";
}

export function getImageUploadSupportText() {
  return `Supported: JPG, PNG, WEBP. Max file size: ${formatBytes(
    IMAGE_UPLOAD_MAX_BYTES
  )}. If your image is HEIC, AVIF, or too large, convert or compress it first.`;
}

export function validateImageUploadFile(file) {
  if (!file) {
    return "Please choose an image file first.";
  }

  if (file.size <= 0) {
    return `The selected file "${file.name}" is empty. Please choose a valid image file.`;
  }

  const extension = getFileExtension(file.name);
  if (extension && !IMAGE_UPLOAD_ALLOWED_EXTENSIONS.includes(extension)) {
    return `The file "${file.name}" uses ${extension.toUpperCase()} format, which is not supported. Please convert it to JPG, PNG, or WEBP.`;
  }

  if (file.type && !IMAGE_UPLOAD_ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return `The file "${file.name}" is not a supported image type. Please upload a JPG, PNG, or WEBP image.`;
  }

  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return `The file "${file.name}" is ${formatBytes(file.size)}, but the limit is ${formatBytes(
      IMAGE_UPLOAD_MAX_BYTES
    )}. Please compress or resize this image and try again.`;
  }

  return "";
}

export { IMAGE_UPLOAD_MAX_BYTES };
