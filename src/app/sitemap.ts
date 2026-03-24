import { MetadataRoute } from "next";
import { NAV_LINKS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://noor-platform.vercel.app";

  return NAV_LINKS.map((link) => ({
    url: `${baseUrl}${link.href}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: link.href === "/" ? 1 : 0.8,
  }));
}
