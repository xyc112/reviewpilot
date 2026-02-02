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
  ...rest
}: SearchBoxProps) => {
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
      style={{
        maxWidth,
        ...style,
      }}
      {...rest}
    />
  );
};

export default SearchBox;
