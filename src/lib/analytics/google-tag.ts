const RAW_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
  (typeof process !== "undefined" && process.env.VITE_GA_MEASUREMENT_ID) ||
  "G-542491749";

/** Google Analytics / gtag.js measurement ID (e.g. G-542491749). */
export const GA_MEASUREMENT_ID = String(RAW_ID).trim();

export function googleTagHead(): {
  links: Array<{ rel: string; href: string }>;
  scripts: Array<{ src?: string; async?: boolean; children?: string }>;
} {
  if (!GA_MEASUREMENT_ID) {
    return { links: [], scripts: [] };
  }

  return {
    links: [{ rel: "preconnect", href: "https://www.googletagmanager.com" }],
    scripts: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
        async: true,
      },
      {
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
      },
    ],
  };
}
