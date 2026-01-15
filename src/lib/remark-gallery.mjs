import { visit } from 'unist-util-visit';

export function remarkGallery() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      const children = node.children;
      const images = children.filter(child => child.type === 'image');
      
      // Only process paragraphs with 2 or more images
      if (images.length <= 1) return;

      const newChildren = [];
      let i = 0;
      
      while (i < children.length) {
        const child = children[i];
        
        if (child.type === 'image') {
          // Create a gallery item container for each image
          const galleryItem = {
            type: 'paragraph', // Changed to div via hName
            data: {
              hName: 'div',
              hProperties: { className: ['gallery-item'] }
            },
            children: [child]
          };
          
          i++;
          // Look ahead for optional caption (emphasis node)
          while (i < children.length) {
            const next = children[i];
            
            // Skip empty text nodes or whitespace between image and caption
            if (next.type === 'text' && !next.value.trim()) {
              i++;
              continue;
            }
            
            // If the next meaningful node is emphasis, treat it as the caption for this image
            if (next.type === 'emphasis') {
              galleryItem.children.push(next);
              i++;
              break;
            }
            
            // Otherwise, this image has no caption, stop looking
            break;
          }
          newChildren.push(galleryItem);
        } else {
          // Keep non-image nodes (like leading text) as they are
          newChildren.push(child);
          i++;
        }
      }
      
      // Update the parent paragraph to be a div with the photo-gallery class
      node.children = newChildren;
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = node.data.hProperties || {};
      
      const existingClasses = node.data.hProperties.className || [];
      const classes = Array.isArray(existingClasses) ? existingClasses : [existingClasses];
      if (!classes.includes('photo-gallery')) {
        classes.push('photo-gallery');
      }
      node.data.hProperties.className = classes;
    });
  };
}
