// EXIF 뷰어용 메타데이터 읽기. exifr 는 JPEG/PNG/TIFF/HEIF 만 알고 WebP 는 모르므로,
// WebP 는 RIFF 청크에서 EXIF 를 직접 꺼내 TIFF 바이트로 넘긴다.
// tests 와 scripts 가 Node 에서 바로 import 할 수 있도록 타입 제거만으로 실행되는 문법만 쓴다.
import exifr from "exifr";

export type Metadata = Record<string, unknown>;

const OPTIONS = {
  tiff: true,
  exif: true,
  gps: true,
  xmp: true,
  iptc: true,
  icc: false,
  ifd1: false,
  interop: false,
  jfif: false,
  ihdr: false,
  makerNote: false,
  userComment: true,
  translateValues: true,
  // EXIF 날짜에는 시간대가 없다. Date 로 바꾸면 보는 사람의 시간대로 왜곡되므로 원문 문자열을 유지한다.
  reviveValues: false,
  mergeOutput: true,
};

const fourcc = (bytes: Uint8Array, offset: number) => String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);

/** Returns the TIFF-format EXIF payload from a WebP file, or null when there is none. */
export function webpExifPayload(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length < 12 || fourcc(bytes, 0) !== "RIFF" || fourcc(bytes, 8) !== "WEBP") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const id = fourcc(bytes, offset);
    const size = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + size;
    if (end > bytes.length) return null;
    if (id === "EXIF") {
      const data = bytes.subarray(start, end);
      // 일부 인코더는 JPEG APP1 처럼 "Exif\0\0" 접두어를 붙인다.
      return fourcc(data, 0) === "Exif" && data[4] === 0 && data[5] === 0 ? data.subarray(6) : data;
    }
    offset = end + (size % 2);
  }
  return null;
}

export function isWebp(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && fourcc(bytes, 0) === "RIFF" && fourcc(bytes, 8) === "WEBP";
}

/** Reads every metadata field exifr can decode. Returns an empty object when the file carries none. */
export async function readMetadata(bytes: Uint8Array): Promise<Metadata> {
  let source: Uint8Array = bytes;
  if (isWebp(bytes)) {
    const payload = webpExifPayload(bytes);
    if (!payload) return {};
    source = payload;
  }
  const result = await exifr.parse(source, OPTIONS);
  return (result ?? {}) as Metadata;
}

/** EXIF "2026:05:17 14:32:08" → "2026-05-17 14:32:08". Other strings pass through. */
export function formatExifDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(value);
  return match ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}` : value;
}
