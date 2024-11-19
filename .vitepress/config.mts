import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Jerry Tech",
	description: "Your Go-to Source for Insightful Content",
	head: [
		[
			"link",
			{
				rel: "shortcut icon",
				href: "/jerry-tech-logo.svg",
			},
		],
		[
			"link",
			{
				rel: "stylesheet",
				href: "https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css",
			},
		],
	],
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
			{
				text: "React",
				items: [
					{
						text: "React 19 and Suspense - A Drama in 3 Acts",
						link: "react/react-19-and-suspense-a-drama-in-3-acts",
					},
					{
						text: "You Should Avoid Fetch on Render",
						link: "react/you-should-avoid-fetch-on-render",
					},
				],
			},
		],
		socialLinks: [{ icon: "github", link: "https://github.com/jerryhuangyu" }],
	},
	srcDir: "posts",
	sitemap: {
		hostname: "https://jerrytech-blog.vercel.app/",
	},
	lastUpdated: true,
	transformPageData: (pageData) => {
		console.log(pageData);
	},
});
