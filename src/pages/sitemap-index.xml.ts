import { getCollection } from 'astro:content';

export async function GET() {
  const notes = await getCollection('notes');

  // Filter out draft notes from sitemap
  const publishedNotes = notes.filter(note => !note.data.draft);

  const baseUrl = 'https://yourname.github.io';

  const pages = [
    '',
    ...publishedNotes.map(note => `notes/${note.slug}`)
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => {
  const url = page ? `${baseUrl}/${page}` : baseUrl;
  const isNote = page.startsWith('notes/');
  const note = isNote ? publishedNotes.find(n => `notes/${n.slug}` === page) : null;
  const lastmod = note ? (note.data.publishedDate || new Date()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const priority = isNote ? '0.8' : '1.0';
  const changefreq = isNote ? 'monthly' : 'weekly';

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