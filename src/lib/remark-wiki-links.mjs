import { visit } from 'unist-util-visit';

export function remarkWikiLinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value) return;

      // Match wiki-style links: [[link-text]] or [[link-text|display-text]]
      const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      const matches = [...node.value.matchAll(wikiLinkRegex)];

      if (matches.length === 0) return;

      const newChildren = [];
      let lastIndex = 0;

      matches.forEach((match) => {
        const [fullMatch, linkText, displayText] = match;
        const matchIndex = match.index;

        // Add text before the link
        if (matchIndex > lastIndex) {
          newChildren.push({
            type: 'text',
            value: node.value.slice(lastIndex, matchIndex)
          });
        }

        // Generate slug from link text (similar to how Astro generates post slugs)
        const slug = linkText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

        // Create link node
        const linkNode = {
          type: 'link',
          url: `/posts/${slug}`,
          title: linkText,
          children: [{
            type: 'text',
            value: displayText || linkText
          }]
        };

        newChildren.push(linkNode);
        lastIndex = matchIndex + fullMatch.length;
      });

      // Add remaining text after the last link
      if (lastIndex < node.value.length) {
        newChildren.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }

      // Replace the current text node with the new children
      parent.children.splice(index, 1, ...newChildren);
    });
  };
}