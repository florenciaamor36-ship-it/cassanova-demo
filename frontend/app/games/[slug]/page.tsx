import Link from 'next/link';

export function generateStaticParams() {
  return [{ slug: 'demo' }];
}

export default function GameDetailPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem', background: '#111827', color: 'white' }}>
      <h1>Cassanova Casino — Demo game</h1>
      <p>This static preview page is running on GitHub Pages.</p>
      <Link href="/" style={{ color: '#facc15' }}>Back to lobby</Link>
    </main>
  );
}
