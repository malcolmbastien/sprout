import fs from 'fs';
import path from 'path';
import { visit } from 'unist-util-visit';

let assetMap = null;

/**
 * Builds a map of filenames and relative paths from the src/assets directory.
 * This allows us to resolve image shortcuts like "image.jpg" or "2022/12/image.jpg".
 */
function buildAssetMap() {
  const assetsDir = path.resolve('src/assets');
  const map = new Map();
  
  if (!fs.existsSync(assetsDir)) {
    return map;
  }

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        const relativePath = path.relative(assetsDir, fullPath);
        const fileName = path.basename(file);
        
        // Store the full relative path from assets root (e.g., "2022/12/image.jpg")
        map.set(relativePath, relativePath);
        
        // Also store the bare filename if not already set (e.g., "image.jpg")
        // Note: This favors the first file found if there are duplicates.
        if (!map.has(fileName)) {
          map.set(fileName, relativePath);
        }
      }
    }
  }
  
  walk(assetsDir);
  return map;
}

export function remarkAssetShortcuts() {
  // Build map once per build process
  if (!assetMap) {
    assetMap = buildAssetMap();
  }
  
  return (tree) => {
    visit(tree, 'image', (node) => {
      const { url } = node;
      
      // Skip if absolute URL, root-relative, or already explicitly relative
      if (url.startsWith('http') || url.startsWith('/') || url.startsWith('.')) {
        return;
      }
      
      // Try to find the image in our asset map
      const relativePath = assetMap.get(url);
      
      if (relativePath) {
        // Prepend the path to assets. 
        // Blog posts are in src/content/posts/, so assets are at ../../assets/
        node.url = `../../assets/${relativePath}`;
      }
    });
  };
}
