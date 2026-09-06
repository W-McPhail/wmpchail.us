// Client-side downscale before upload so the database only stores what the page needs.
// Large PNG/JPEG/WebP files are resized to MAX_WIDTH and re-encoded as WebP; GIFs and small files pass through.

const MAX_WIDTH = 1800;
const RESIZE_OVER_BYTES = 800 * 1024;

export interface PreparedImage {
  blob: Blob;
  name: string;
  width: number;
  height: number;
}

function load(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
    img.src = url;
  });
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const img = await load(file);
  const { naturalWidth: w, naturalHeight: h } = img;
  const shouldResize = file.type !== "image/gif" && (w > MAX_WIDTH || file.size > RESIZE_OVER_BYTES);
  if (!shouldResize) return { blob: file, name: file.name, width: w, height: h };

  const scale = Math.min(1, MAX_WIDTH / w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) return { blob: file, name: file.name, width: w, height: h };
  return { blob, name: file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp", width: canvas.width, height: canvas.height };
}
