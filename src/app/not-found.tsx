export default function NotFound() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center', marginTop: '4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>404 - Not Found</h1>
      <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          color: '#2563eb',
          textDecoration: 'underline',
          fontSize: '1.125rem'
        }}
      >
        Go back home
      </a>
    </div>
  );
}
