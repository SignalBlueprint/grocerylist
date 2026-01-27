'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97757', marginBottom: '1rem' }}>
        Something went wrong
      </h1>
      <p style={{ marginBottom: '1.5rem', color: '#6B645A' }}>
        An error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#6B8F71',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        Try again
      </button>
    </div>
  );
}
