import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages";

/**
 * Extensionless social image endpoint.
 *
 * Cloudflare Hotlink Protection rejects externally-referred URLs ending in
 * common image extensions. Social crawlers use those referrers, so the
 * extensionless route keeps the preview fetchable while returning a truthful
 * JPEG content type.
 */
export const GET: APIRoute = async () => {
  const buffer = await generateOgImageForSite();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
};
