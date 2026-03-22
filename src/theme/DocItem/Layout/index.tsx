import React, { useState } from "react";
import Layout from "@theme-original/DocItem/Layout";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import type LayoutType from "@theme/DocItem/Layout";
import type { WrapperProps } from "@docusaurus/types";

type Props = WrapperProps<typeof LayoutType>;

function CopyPageButton() {
  const [state, setState] = useState<"idle" | "copied">("idle");
  const { metadata } = useDoc();

  const handleCopy = async () => {
    const article = document.querySelector("article");
    if (!article) return;

    function nodeToMd(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
      const el = node as HTMLElement;
      const tag = el.tagName?.toLowerCase();

      if (tag === "pre") {
        const codeEl = el.querySelector("code");
        const lang =
          Array.from(codeEl?.classList ?? [])
            .find((c) => c.startsWith("language-"))
            ?.replace("language-", "") ?? "";
        return `\`\`\`${lang}\n${codeEl?.innerText ?? el.innerText}\n\`\`\`\n\n`;
      }
      if (tag === "code") return `\`${el.innerText}\``;
      if (tag === "h1") return `# ${el.innerText}\n\n`;
      if (tag === "h2") return `## ${el.innerText}\n\n`;
      if (tag === "h3") return `### ${el.innerText}\n\n`;
      if (tag === "h4") return `#### ${el.innerText}\n\n`;
      if (tag === "li") return `- ${Array.from(el.childNodes).map(nodeToMd).join("").trim()}\n`;
      if (tag === "ul" || tag === "ol") return Array.from(el.childNodes).map(nodeToMd).join("") + "\n";
      if (tag === "p") return Array.from(el.childNodes).map(nodeToMd).join("").trim() + "\n\n";
      if (tag === "table") return el.innerText + "\n\n";
      if (tag === "strong" || tag === "b") return `**${el.innerText}**`;
      if (tag === "em" || tag === "i") return `_${el.innerText}_`;
      if (tag === "a") return `[${el.innerText}](${el.getAttribute("href") ?? ""})`;
      if (tag === "hr") return "---\n\n";
      if (["nav", "button", "footer", "aside"].includes(tag)) return "";
      return Array.from(el.childNodes).map(nodeToMd).join("");
    }

    const body = Array.from(article.childNodes).map(nodeToMd).join("").trim();
    try {
      await navigator.clipboard.writeText(body);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="copy-page-bar">
      <button
        onClick={handleCopy}
        className={`copy-page-btn ${state === "copied" ? "copy-page-btn--copied" : ""}`}
        title="Copy page"
      >
        {state === "copied" ? (
          <>
            <span className="copy-page-icon">✓</span>
            Copied!
          </>
        ) : (
          <>
            <span className="copy-page-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </span>
            Copy page
          </>
        )}
      </button>
    </div>
  );
}

export default function LayoutWrapper(props: Props): JSX.Element {
  return (
    <>
      <CopyPageButton />
      <Layout {...props} />
    </>
  );
}
