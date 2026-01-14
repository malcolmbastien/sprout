import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('posts');

  // Filter out draft posts from sitemap
  const publishedPosts = posts.filter(post => !post.data.draft);

  const baseUrl = 'https://yourdomain.com';

  const pages = [
    '',
    ...publishedPosts.map(post => `posts/${post.slug}`)
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => {
  const url = page ? `${baseUrl}/${page}` : baseUrl;
  const isPost = page.startsWith('posts/');
  const post = isPost ? publishedPosts.find(p => `posts/${p.slug}` === page) : null;
  const lastmod = post ? (post.data.publishedDate || new Date()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const priority = isPost ? '0.8' : '1.0';
  const changefreq = isPost ? 'monthly' : 'weekly';

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}