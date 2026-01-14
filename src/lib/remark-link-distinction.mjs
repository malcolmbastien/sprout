import { visit } from 'unist-util-visit';

export function remarkLinkDistinction() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      // Check if it's an internal link (already has internal-link class or is internal path)
      const isInternal = node.data?.hProperties?.className?.includes('internal-link');
      
      // Add external-link class if it's not already classified as internal
      if (!isInternal) {
        // Consider a link external if it starts with http://, https://, or is not a relative/internal path
        const isExternalUrl = node.url?.startsWith('http://') || node.url?.startsWith('https://');
        
        if (isExternalUrl) {
          if (!node.data) {
            node.data = {};
          }
          if (!node.data.hProperties) {
            node.data.hProperties = {};
          }
          if (!node.data.hProperties.className) {
            node.data.hProperties.className = [];
          } else if (typeof node.data.hProperties.className === 'string') {
            node.data.hProperties.className = [node.data.hProperties.className];
          }
          node.data.hProperties.className.push('external-link');
        }
      }
    });
  };
}
