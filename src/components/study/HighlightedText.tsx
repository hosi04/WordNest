function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Renders `text` with occurrences of `term` (and simple inflections like "-s", "-ed") in bold. */
export function HighlightedText({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>
  const pattern = new RegExp(`(\\b${escapeRegExp(term.trim())}\\w*)`, 'gi')
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  )
}
