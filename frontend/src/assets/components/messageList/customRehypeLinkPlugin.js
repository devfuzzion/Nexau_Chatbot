import { visit } from "unist-util-visit";

export const rehypeExternalLinks = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "a" && node.properties?.href) {
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
      }
    });
  };
};
