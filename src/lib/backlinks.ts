import { getCollection } from 'astro:content';

// Function to extract wiki-style links from raw markdown content
function extractWikiLinks(content: string): string[] {
  const links: string[] = [];

  // Match wiki-style links: [[link-text]] or [[link-text|display-text]]
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const matches = [...content.matchAll(wikiLinkRegex)];

  matches.forEach((match) => {
    const linkText = match[1].trim();

    // Generate slug from link text (same logic as in remark-wiki-links.mjs)
    const slug = linkText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    links.push(slug);
  });

  return links;
}

// Function to build the backlinks map
export async function buildBacklinksMap(): Promise<Record<string, string[]>> {
  const posts = await getCollection('posts');
  const backlinksMap: Record<string, string[]> = {};

  // Initialize empty arrays for all posts
  posts.forEach(post => {
    backlinksMap[post.slug] = [];
  });

  // Extract links from each post and build the backlinks map
  posts.forEach(post => {
    // post.body contains the raw markdown content
    const content = post.body || '';
    const linkedSlugs = extractWikiLinks(content);

    // Add this post as a backlink for each post it links to
    linkedSlugs.forEach(linkedSlug => {
      // Only add if the linked post exists (avoid broken links)
      if (backlinksMap[linkedSlug] !== undefined && linkedSlug !== post.slug) {
        backlinksMap[linkedSlug].push(post.slug);
      }
    });
  });
  return backlinksMap;
}

// Function to get backlinks for a specific post
export async function getBacklinksForPost(postSlug: string): Promise<string[]> {
  const backlinksMap = await buildBacklinksMap();
  return backlinksMap[postSlug] || [];
}