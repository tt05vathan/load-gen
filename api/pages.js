// Vercel Serverless API for pages
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    const { id } = query;

    switch (method) {
      case 'GET':
        if (id) {
          // Get single page
          const page = await kv.hget('birthday_pages', id);
          if (!page) {
            return res.status(404).json({ error: 'Page not found' });
          }
          return res.status(200).json(page);
        } else {
          // Get all pages
          const pages = await kv.hgetall('birthday_pages') || {};
          const pagesArray = Object.values(pages).sort((a, b) => a.id - b.id);
          return res.status(200).json(pagesArray);
        }

      case 'POST':
        // Create new page
        const newId = Date.now();
        const newPage = {
          id: newId,
          text: body.text || '',
          image: body.image || null,
          createdAt: new Date().toISOString(),
        };
        
        await kv.hset('birthday_pages', { [newId]: newPage });
        return res.status(201).json(newPage);

      case 'PUT':
        // Update existing page
        if (!id) {
          return res.status(400).json({ error: 'Page ID required' });
        }

        const existingPage = await kv.hget('birthday_pages', id);
        if (!existingPage) {
          return res.status(404).json({ error: 'Page not found' });
        }

        const updatedPage = {
          ...existingPage,
          ...body,
          updatedAt: new Date().toISOString(),
        };

        await kv.hset('birthday_pages', { [id]: updatedPage });
        return res.status(200).json(updatedPage);

      case 'DELETE':
        // Delete page
        if (!id) {
          return res.status(400).json({ error: 'Page ID required' });
        }

        await kv.hdel('birthday_pages', id);
        return res.status(200).json({ message: 'Page deleted' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}