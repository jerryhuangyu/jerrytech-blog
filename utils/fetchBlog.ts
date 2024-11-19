import os from "node:os";
import { resolve } from "node:path";
import fs from "fs-extra";

export const fetchBlogs = async () => {
	const blogsInfo = await fs.readFile(
		resolve(process.cwd(), "./posts/blogs.txt"),
		"utf-8",
	);

	return blogsInfo
		.split(os.EOL)
		.filter((item) => item.endsWith(".md"))
		.map((item) => resolve(process.cwd(), `./posts/${item}`));
};
