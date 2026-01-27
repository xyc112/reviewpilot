import React from "react";
import { Spin } from "antd";

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <Spin size="large" />
    </div>
  );
};

export default LoadingSpinner;
