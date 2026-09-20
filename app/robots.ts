import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/dashboard",
          "/*/account",
          "/*/checkout",
          "/*/cart",
          "/*/login",
          "/*/signup",
          "/*/forgot-password",
          "/*/notifications",
          "/api/",
        ],
      },
    ],
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
