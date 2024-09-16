import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jerry Tech",
  description: "Your Go-to Source for Insightful Content",
  head: [["link", { rel: "shortcut icon", href: "/jerry-tech-logo.svg" }]],
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    logo: "/jerry-tech-logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "About Me", link: "/about-me" },
    ],
    sidebar: [
      {
        items: [
          { text: "About Me", link: "/about-me" },
          { text: "Projects", link: "/projects" },
        ],
      },
      {
        text: "Frontend Infra",
        items: [
          {
            text: "Deep Dive into Vite",
            link: "frontend-infra/deep-dive-into-vite",
          },
          {
            text: "Reasons to Migrate to Rsbuild",
            link: "frontend-infra/migrate-from-vite-to-rsbuild",
          },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/jerryhuangyu" }],
  },
});
