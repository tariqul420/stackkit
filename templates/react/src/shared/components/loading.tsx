export default function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}
