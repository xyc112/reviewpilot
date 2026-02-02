import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { InputProps } from "antd";

export interface SearchBoxProps extends Omit<
  InputProps,
  "prefix" | "addonAfter" | "value" | "onChange" | "enterButton"
> {
  /** 当前搜索值，受控 */
  value: string;
  /** 输入变化回调 */
  onChange: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 是否显示搜索按钮（enter 区域）。默认 false 为仅图标 */
  enterButton?: React.ReactNode;
  /** 回车或点击搜索时回调 */
  onSearch?: (value: string) => void;
  /** 最大宽度（像素），默认 600；在 Compact 布局中可传 undefined 并配合 style={{ flex: 1 }} */
  maxWidth?: number;
  /** 尺寸，默认 large */
  size?: "large" | "middle" | "small";
}

const SearchBox = ({
  value,
  onChange,
  placeholder = "搜索...",
  enterButton = false,
  onSearch,
  maxWidth = 600,
  size = "large",
  allowClear = true,
  style,
  className,
  ...rest
}: SearchBoxProps) => {
  const isDefaultMaxWidth = maxWidth === 600;
  return (
    <Input.Search
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onSearch={onSearch}
      allowClear={allowClear}
      enterButton={
        enterButton === true ? (
          <SearchOutlined />
        ) : (
          ((enterButton ?? false) as React.ReactNode)
        )
      }
      size={size}
      className={[
        "w-full rounded-xl border-stone-200 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-neutral-600 dark:bg-neutral-900/50",
        isDefaultMaxWidth ? "max-w-[600px]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={isDefaultMaxWidth ? style : { maxWidth, ...style }}
      {...rest}
    />
  );
};

export default SearchBox;
