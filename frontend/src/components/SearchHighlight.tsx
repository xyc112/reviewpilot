interface SearchHighlightProps {
  text: string;
  searchQuery: string;
}

const SearchHighlight = ({ text, searchQuery }: SearchHighlightProps) => {
  if (!searchQuery) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${searchQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="highlighted-text">
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
