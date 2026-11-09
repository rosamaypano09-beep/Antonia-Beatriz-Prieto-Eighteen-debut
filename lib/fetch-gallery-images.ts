import fs from "fs"
import path from "path"

const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif"])

/** Files never shown in the gallery (keep in sync with HIDDEN_PHOTOS in content/site.ts). */
const HIDDEN_GALLERY_FILES = new Set([
  "mobile-background/debut (4).jpg",
  "mobile-background/debut (7).png",
])

/** Encode each path segment so spaces/parentheses work in production URLs. */
export function encodePublicImagePath(src: string): string {
  return (
    "/" +
    src
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/")
  )
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}

function readPngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function readJpegSize(buf: Buffer): { width: number; height: number } | null {
  let i = 2
  while (i < buf.length - 9 && buf[i] === 0xff) {
    const marker = buf[i + 1]
    const len = buf.readUInt16BE(i + 2)
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + len
  }
  return null
}

function readWebpSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 30 || buf.toString("ascii", 8, 12) !== "WEBP") return null
  const chunk = buf.toString("ascii", 12, 16)
  if (chunk === "VP8X") {
    return {
      width: buf.readUIntLE(24, 3) + 1,
      height: buf.readUIntLE(27, 3) + 1,
    }
  }
  if (chunk === "VP8 ") {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    }
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21)
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    }
  }
  return null
}

function readFilePrefix(filePath: string, bytes = 65536): Buffer {
  const fd = fs.openSync(filePath, "r")
  try {
    const buf = Buffer.alloc(bytes)
    const n = fs.readSync(fd, buf, 0, bytes, 0)
    return buf.subarray(0, n)
  } finally {
    fs.closeSync(fd)
  }
}

function readImageSize(filePath: string): { width: number; height: number } {
  try {
    const buf = readFilePrefix(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const size =
      ext === ".png"
        ? readPngSize(buf)
        : ext === ".webp"
          ? readWebpSize(buf)
          : ext === ".jpg" || ext === ".jpeg"
            ? readJpegSize(buf)
            : null
    if (size && size.width > 0 && size.height > 0) return size
  } catch {
    // Fall through to defaults if the file cannot be read.
  }
  return { width: 2400, height: 1600 }
}

export type GalleryImageFile = {
  src: string
  width: number
  height: number
}

function readImagesFromPublicDir(relativeDir: string): GalleryImageFile[] {
  const dir = path.join(process.cwd(), "public", relativeDir)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .filter((file) => !HIDDEN_GALLERY_FILES.has(`${relativeDir}/${file}`))
    .sort(naturalSort)
    .map((file) => {
      const size = readImageSize(path.join(dir, file))
      return {
        src: encodePublicImagePath(`/${relativeDir}/${file}`),
        width: size.width,
        height: size.height,
      }
    })
}

export type GalleryFolderImages = {
  desktop: GalleryImageFile[]
  mobile: GalleryImageFile[]
}

/** Gallery list from public/desktop-background and public/mobile-background. */
export async function fetchGalleryImages(): Promise<GalleryFolderImages> {
  return {
    desktop: readImagesFromPublicDir("desktop-background"),
    mobile: readImagesFromPublicDir("mobile-background"),
  }
}
