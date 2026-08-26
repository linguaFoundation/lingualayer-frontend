/** Placeholder card shown while a page of datasets is loading (issue #2). */
export function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-line--title" />
      <div className="skeleton-line skeleton-line--sub" />
      <div className="skeleton-line skeleton-line--sub" style={{ width: "55%" }} />
    </div>
  );
}
