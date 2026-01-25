'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#FDFAF7' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', marginTop: '4rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#D97757',
            marginBottom: '1rem',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            Application Error
          </h1>
          <p style={{ marginBottom: '1.5rem', color: '#6B645A' }}>
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
