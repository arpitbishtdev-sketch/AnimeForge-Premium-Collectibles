import "./Skeleton.css";

export function Skeleton({ width, height, radius, className = "" }) {
  const style = {
    width: width || "100%",
    height: height || "16px",
    borderRadius: radius || "var(--radius-sm)",
  };
  return <span className={`skeleton ${className}`} style={style} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-img skeleton" />
      <div className="skeleton-card-body">
        <Skeleton height="10px" width="55px" />
        <Skeleton height="18px" width="75%" />
        <Skeleton height="13px" width="45%" />
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <Skeleton height="30px" width="90px" />
          <Skeleton height="30px" width="70px" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="skeleton-detail">
      <div className="skeleton-detail-left">
        <div className="skeleton skeleton-detail-main" />
        <div className="skeleton-thumbs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-thumb" />
          ))}
        </div>
      </div>
      <div className="skeleton-detail-right">
        <Skeleton height="14px" width="80px" />
        <Skeleton height="52px" width="90%" />
        <Skeleton height="14px" width="100%" />
        <Skeleton height="14px" width="85%" />
        <Skeleton height="14px" width="70%" />
        <Skeleton height="48px" width="160px" style={{ marginTop: 16 }} />
        <Skeleton height="56px" width="200px" />
      </div>
    </div>
  );
}

export function CollectionsSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "28px",
        padding: "40px",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
