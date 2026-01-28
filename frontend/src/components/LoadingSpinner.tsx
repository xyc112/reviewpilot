import { Spin } from "antd";

const LoadingSpinner = () => {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <Spin size="large" />
    </div>
  );
};

export default LoadingSpinner;
