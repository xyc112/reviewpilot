interface SearchHighlightProps {
  text: string;
  searchQuery: string;
}

const SearchHighlight = ({ text, searchQuery }: SearchHighlightProps) => {
  if (!searchQuery) {
    return <>{text}</>;
  }

  const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  const highlightStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    color: "#3730a3",
    padding: "0.125rem 0.25rem",
    borderRadius: "4px",
    fontWeight: 600,
    boxShadow: "0 1px 3px rgba(55, 48, 163, 0.2)",
  };

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
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
