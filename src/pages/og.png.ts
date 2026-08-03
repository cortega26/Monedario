import type { APIRoute } from "astro";
import { generateOgImageForSitePng } from "@/utils/generateOgImages";

export const GET: APIRoute = async () => {
  const buffer = await generateOgImageForSitePng();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
};
