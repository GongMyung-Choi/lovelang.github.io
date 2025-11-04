import type { VercelRequest, VercelResponse } from '@vercel/node';
import registry from '../luwain_trinity/personas/registry.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json(registry);
}
