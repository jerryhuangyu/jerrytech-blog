import fs from "fs-extra";
import matter from "gray-matter";
import readingTime from "reading-time";
import { fetchBlogs } from "./fetchBlog";

// * get all blog markdown files path
const blogs = await fetchBlogs();

function removeBetween(
	markdownContent: string,
	startFlag: string,
	endFlag: string,
) {
	const lines = markdownContent.split("\n");
	const startIndex = lines.findIndex((line) => line.includes(startFlag.trim()));
	const endIndex = lines.findIndex((line) => line.includes(endFlag.trim()));
	if (startIndex !== -1 && endIndex !== -1) {
		lines.splice(startIndex, endIndex - startIndex + 1);
	}
	return lines.join("\n");
}

// * traverse all blog markdown files
for (const filePath of blogs) {
	const markdownContent = fs.readFileSync(filePath, "utf-8");
	// MUST remove previous readingTime block before calculating stats
	const startFlag = "<!-- READING-TIME:START -->";
	const endFlag = "<!-- READING-TIME:END -->";
	const finalMarkdownContent = removeBetween(
		markdownContent,
		startFlag,
		endFlag,
	);

	const stats = readingTime(finalMarkdownContent);
	// console.log(filePath, stats);
	// ...(path).md { text: '4 min read', minutes: 3.59, time: 215400, words: 718 }

	const parsed = matter(finalMarkdownContent);
	const frontmatter = parsed.data;

	// merge readingTime to frontmatter
	const newFrontMatter = {
		...frontmatter,
		readingTime: stats.text,
		words: stats.words,
	};

	const mainContent = parsed.content;
	// injected readingTime block
	const readingTimeBlock = `${startFlag}\n>  🕛 reading time: ${stats.text} | 🔖 words: ${stats.words}\n${endFlag}`;

	const regex = /^#(?!#)(.+)$/gm;
	const newMarkdownContent = mainContent.replaceAll(regex, (match, args) => {
		return `${match}\n${readingTimeBlock}`;
	});

	// write back
	const updatedMarkdownContent = matter.stringify(
		newMarkdownContent,
		newFrontMatter,
	);
	fs.writeFileSync(filePath, updatedMarkdownContent);
}

console.log("Reading time inject completed.");
