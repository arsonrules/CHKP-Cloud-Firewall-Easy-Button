export default function Loading({ children }) {
  return (
    <div className="loading">
      <div className="track" />
      <p className="loading-text">{children}</p>
    </div>
  );
}
