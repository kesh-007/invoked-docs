import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "installation",
    {
      type: "category",
      label: "Agent API",
      items: ["api/agent", "api/generate", "api/stream", "api/generate-object"],
    },
    {
      type: "category",
      label: "Features",
      items: ["features/tools", "features/skills", "features/mcp", "features/memory", "features/processors"],
    },
    "examples",
  ],
};

export default sidebars;
