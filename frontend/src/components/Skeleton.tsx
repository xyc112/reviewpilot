import { Skeleton as AntSkeleton, Card, Row, Col } from "antd";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  active?: boolean;
}

const Skeleton = ({
  width = "100%",
  height = 16,
  className = "",
  active = true,
}: SkeletonProps) => {
  return (
    <AntSkeleton.Button
      active={active}
      style={{ width, height }}
      className={className}
    />
  );
};

interface SkeletonGridProps {
  count?: number;
}

const SkeletonGrid = ({ count = 3 }: SkeletonGridProps) => {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={8}>
          <Card>
            <AntSkeleton
              active
              paragraph={{ rows: 3 }}
              title={{ width: "60%" }}
            />
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <AntSkeleton.Button active size="small" style={{ width: 80 }} />
              <AntSkeleton.Button active size="small" style={{ width: 80 }} />
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export { Skeleton, SkeletonGrid };
