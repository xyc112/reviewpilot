import { Spin } from "antd";

const LoadingSpinner = () => {
  return (
    <div className="text-center py-16 px-8">
      <Spin size="large" />
    </div>
  );
};

export default LoadingSpinner;
