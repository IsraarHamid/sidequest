"""Image compression before upload.

Phone photos are often 5–20 MB; Supabase Storage caps individual files (50 MB on
the free tier) and our bucket is 1 GB total. We downscale + re-encode to JPEG so
a typical upload lands at a few hundred KB, keeping well under both limits.

Runs server-side so it's guaranteed regardless of the client. Pillow ships
prebuilt wheels (no extra system libs needed in Docker). Unsupported inputs
(e.g. HEIC without a plugin) pass through unchanged.
"""
from io import BytesIO

_MAX_DIM = 1600      # longest edge, px
_QUALITY = 82        # JPEG quality


def compress_image(data: bytes, content_type: str | None):
    """Return (bytes, ext, content_type). Falls back to the original on failure."""
    try:
        from PIL import Image, ImageOps

        img = Image.open(BytesIO(data))
        img = ImageOps.exif_transpose(img)          # honour camera orientation
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.thumbnail((_MAX_DIM, _MAX_DIM))          # downscale, keep aspect
        out = BytesIO()
        img.save(out, format="JPEG", quality=_QUALITY, optimize=True)
        compressed = out.getvalue()
        # Only use it if it actually helped.
        if compressed and len(compressed) < len(data):
            return compressed, "jpg", "image/jpeg"
        return data, None, content_type
    except Exception as exc:  # noqa: BLE001 - never block an upload on compression
        print(f"[images] compression skipped: {exc}")
        return data, None, content_type
