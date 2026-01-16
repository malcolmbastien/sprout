import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';

export function remarkWikiLinks() {
  const slugToStatus = new Map();
  
  // Find project root by looking for astro.config.mjs or package.json
  let root = process.cwd();
  while (root !== path.dirname(root)) {
    if (fs.existsSync(path.join(root, 'astro.config.mjs')) || fs.existsSync(path.join(root, 'package.json'))) {
      break;
    }
    root = path.dirname(root);
  }

  const postsDir = path.join(root, 'src/content/posts');
  
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const filePath = path.join(postsDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const slug = file.replace(/\.md(x)?$/, '');
          
          const statusMatch = content.match(/^status:\s*["']?([^"'\s#\r\n]+)/m);
          if (statusMatch) {
            slugToStatus.set(slug.toLowerCase(), statusMatch[1].trim());
          }
        } catch (e) {
          // Ignore read errors
        }
      }
    }
  }

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

        const slug = linkTarget
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        const status = slugToStatus.get(slug);
        const label = (displayText || linkTarget).trim();

        const linkNode = {
          type: 'link',
          url: `/posts/${slug}`,
          title: linkTarget.trim(),
          data: {
            hProperties: {
              className: ['internal-link'],
              'data-status': status || ''
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
