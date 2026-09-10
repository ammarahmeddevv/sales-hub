import type { MetadataRoute } from "next";

/* Private working tool — keep it out of every search engine. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
