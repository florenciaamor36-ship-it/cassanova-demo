export function generateStaticParams() {
  return [{ slug: 'demo' }];
}

export default function PromotionPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem', background: '#111827', color: 'white' }}>
      <h1>Cassanova Casino — Promotion demo</h1>
      <p>This static preview page is running on GitHub Pages.</p>
    </main>
  );
}
