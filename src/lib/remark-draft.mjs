import { visit } from 'unist-util-visit';

export function remarkDraftContainer() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        if (node.name !== 'draft') return;

        const data = node.data || (node.data = {});
        const tagName = node.type === 'textDirective' ? 'span' : 'div';

        data.hName = tagName;
        data.hProperties = {
          ...(data.hProperties || {}),
          className: ['draft-container', `draft-${node.type}`]
        };
      }
    });
  };
}
