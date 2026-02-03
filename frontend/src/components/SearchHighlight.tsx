interface SearchHighlightProps {
  text: string;
  searchQuery: string;
}

const SearchHighlight = ({ text, searchQuery }: SearchHighlightProps) => {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  if (!searchQuery) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${searchQuery})`, "gi");
  const parts = text.split(regex);

  const highlightStyle: React.CSSProperties = {
    background: isDark
      ? "linear-gradient(135deg, #78350f 0%, #92400e 100%)"
      : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    color: isDark ? "#fef3c7" : "#92400e",
    padding: "0.125rem 0.25rem",
    borderRadius: "4px",
    fontWeight: 600,
    boxShadow: isDark
      ? "0 1px 3px rgba(254, 243, 199, 0.3)"
      : "0 1px 3px rgba(146, 64, 14, 0.2)",
  };

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} style={highlightStyle}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

export { SearchHighlight };
