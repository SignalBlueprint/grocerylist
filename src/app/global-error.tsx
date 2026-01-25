'use client';

export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', marginTop: '4rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
            Application Error
          </h1>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
            Something went wrong. Please reload the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
