import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "invoked",
  tagline: "Build Claude-powered agents, cron jobs, and webhook automations — no API key needed.",
  favicon: "img/favicon.ico",
  future: { v4: true },
  url: "https://your-domain.com",
  baseUrl: "/",
  onBrokenLinks: "warn",
  markdown: { hooks: { onBrokenMarkdownLinks: "warn" } },
  i18n: { defaultLocale: "en", locales: ["en"] },
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "invoked",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/kesh-007/invoked",
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://www.npmjs.com/package/invoked",
          label: "npm",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Built with invoked · ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ["bash", "typescript", "json"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
