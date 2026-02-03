import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  maxWidth?: number;
  size?: "large" | "middle" | "small";
  allowClear?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const sizeClass = {
  large: "h-11 text-base",
  middle: "h-9 text-sm",
  small: "h-8 text-sm",
} as const;

const SearchBox = ({
  value,
  onChange,
  placeholder = "搜索...",
  onSearch,
  maxWidth = 600,
  size = "large",
  allowClear = true,
  style,
  className,
}: SearchBoxProps) => {
  const isDefaultMaxWidth = maxWidth === 600;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border border-input bg-background shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring/20",
        sizeClass[size],
        isDefaultMaxWidth && "max-w-[600px]",
        className,
      )}
      style={isDefaultMaxWidth ? style : { maxWidth, ...style }}
    >
      <SearchIcon className="ml-3 size-4 shrink-0 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className="h-full min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      {allowClear && value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mr-1 size-8 shrink-0"
          onClick={() => {
            onChange("");
            onSearch?.("");
          }}
          aria-label="清除"
        >
          <X className="size-4 text-muted-foreground" />
        </Button>
      ) : null}
      {onSearch ? (
        <Button
          type="button"
          variant="default"
          size="sm"
          className="mr-2"
          onClick={() => {
            onSearch(value);
          }}
          aria-label="搜索"
        >
          <SearchIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  );
};

export default SearchBox;
