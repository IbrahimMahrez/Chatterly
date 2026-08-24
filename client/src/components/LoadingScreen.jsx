export default function LoadingScreen({ compact = false }) {
  return (
    <div className={`loading-screen${compact ? ' loading-screen-compact' : ''}`} role="status" aria-live="polite">
      <div className="loading-content">
        <span className="loading-wordmark" aria-label="Chatterly">Chatterly</span>
        <span className="loading-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
