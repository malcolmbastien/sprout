import { visit } from 'unist-util-visit';

export function remarkHashtags() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value) return;
      
      // Skip if already inside a link or image
      if (parent && (parent.type === 'link' || parent.type === 'image')) return;

      // Match hashtags: #tag-name
      // Preceded by start of line or space
      // Consists of # followed by letters, numbers, hyphens, or underscores
      const hashtagRegex = /(^|\s)#([\w-]+)/g;
      
      const newChildren = [];
      let lastIndex = 0;
      let match;

      while ((match = hashtagRegex.exec(node.value)) !== null) {
        const [fullMatch, space, tagName] = match;
        const matchIndex = match.index;

        // Add text before the hashtag (including the leading space if captured)
        const textBeforeMatchEnd = matchIndex + space.length;
        if (textBeforeMatchEnd > lastIndex) {
          newChildren.push({
            type: 'text',
            value: node.value.slice(lastIndex, textBeforeMatchEnd)
          });
        }

        // Create link node for the hashtag pointing to /topics/
        const linkNode = {
          type: 'link',
          url: `/topics/${tagName}`,
          title: `#${tagName}`,
          data: {
            hProperties: {
              className: 'inline-tag'
            }
          },
          children: [{
            type: 'text',
            value: `#${tagName}`
          }]
        };

        newChildren.push(linkNode);
        lastIndex = matchIndex + fullMatch.length;
      }

      if (newChildren.length === 0) return;

      // Add remaining text
      if (lastIndex < node.value.length) {
        newChildren.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }

      // Replace the current text node
      parent.children.splice(index, 1, ...newChildren);
    });
  };
}
