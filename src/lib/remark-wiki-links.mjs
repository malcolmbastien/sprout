import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';

// Cache for slug to stage mapping to avoid reading files on every render
let slugToStageCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 2000; // 2 seconds (good for dev server responsiveness)

export function remarkWikiLinks() {
  const now = Date.now();
  
  // Rebuild cache if it doesn't exist or is too old
  if (!slugToStageCache || (now - lastCacheTime > CACHE_TTL)) {
    slugToStageCache = new Map();
    lastCacheTime = now;
    
    // Find project root by looking for astro.config.mjs or package.json
    let root = process.cwd();
    while (root !== path.dirname(root)) {
      if (fs.existsSync(path.join(root, 'astro.config.mjs')) || fs.existsSync(path.join(root, 'package.json'))) {
        break;
      }
      root = path.dirname(root);
    }

    const notesDir = path.join(root, 'src/content/notes');
    
    if (fs.existsSync(notesDir)) {
      try {
        const files = fs.readdirSync(notesDir);
        for (const file of files) {
          if (file.endsWith('.md') || file.endsWith('.mdx')) {
            const filePath = path.join(notesDir, file);
            try {
              // We only need the first few bytes to find the frontmatter, but reading whole file is safer for now
              const content = fs.readFileSync(filePath, 'utf-8');
              const slug = file.replace(/\.md(x)?$/, '');
              
              const stageMatch = content.match(/^stage:\s*["']?([^"'\s#\r\n]+)/m);
              if (stageMatch) {
                slugToStageCache.set(slug.toLowerCase(), stageMatch[1].trim());
              }
            } catch (e) {
              // Ignore read errors
            }
          }
        }
      } catch (e) {
        // Ignore directory read errors
      }
    }
  }

  const slugToStage = slugToStageCache;

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value) return;
      if (parent && (parent.type === 'link' || parent.type === 'image')) return;

      const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      
      const newChildren = [];
      let lastIndex = 0;
      let match;

      while ((match = wikiLinkRegex.exec(node.value)) !== null) {
        const [fullMatch, linkTarget, displayText] = match;
        const matchIndex = match.index;

        if (matchIndex > 0 && node.value[matchIndex - 1] === '!') continue;

        if (matchIndex > lastIndex) {
          newChildren.push({
            type: 'text',
            value: node.value.slice(lastIndex, matchIndex)
          });
        }

        // Standardize slug generation
        const slug = linkTarget
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        const stage = slugToStage.get(slug);
        const label = (displayText || linkTarget).trim();

        const linkNode = {
          type: 'link',
          url: `/notes/${slug}`,
          title: linkTarget.trim(),
          data: {
            hProperties: {
              className: ['internal-link'],
              'data-stage': stage || ''
            }
          },
          children: [
            {
              type: 'text',
              value: label,
              data: {
                hName: 'span',
                hProperties: { className: ['link-text'] }
              }
            }
          ]
        };

        newChildren.push(linkNode);
        lastIndex = matchIndex + fullMatch.length;
      }

      if (newChildren.length === 0) return;

      if (lastIndex < node.value.length) {
        newChildren.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }

      parent.children.splice(index, 1, ...newChildren);
    });
  };
}
