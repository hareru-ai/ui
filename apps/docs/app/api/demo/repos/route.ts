const items = [
  { value: 'hareru-ui', label: 'hareru-ai/ui' },
  { value: 'next-js', label: 'vercel/next.js' },
  { value: 'react', label: 'facebook/react' },
  { value: 'typescript', label: 'microsoft/typescript' },
  { value: 'vite', label: 'vitejs/vite' },
  { value: 'tailwindcss', label: 'tailwindlabs/tailwindcss' },
  { value: 'biome', label: 'biomejs/biome' },
  { value: 'vitest', label: 'vitest-dev/vitest' },
];

export function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').toLowerCase();
  const filtered = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
  return Response.json({ items: filtered });
}
