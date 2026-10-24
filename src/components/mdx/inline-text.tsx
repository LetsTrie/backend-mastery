/** Renders a plain-text prop (e.g. a figure caption) with `inline code` spans. */
export function InlineText({ text }: { text: string }) {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("`") && part.endsWith("`") ? (
        <code key={index}>{part.slice(1, -1)}</code>
      ) : (
        part
      ),
    );
}
