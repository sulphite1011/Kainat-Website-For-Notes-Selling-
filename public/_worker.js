import { seedNotes, seedOrders, seedNotifications, seedSettings } from '../src/data/seedData.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Admin Login
    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
      try {
        const body = await request.json();
        const username = (body.username || '').trim().toLowerCase();
        const password = (body.password || '').trim();

        if (username === 'kainat' && password === 'HamadJani') {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Welcome Kainat! Admin portal authenticated.',
              token: `admin_tok_${Date.now()}_kainat_worker`,
              admin: {
                username: 'Kainat',
                role: 'owner',
                email: 'ka8984510@gmail.com',
              },
            }),
            { headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid credentials. Username or password incorrect.',
          }),
          { status: 401, headers: corsHeaders }
        );
      } catch {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid request body' }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // 2. Admin Orders & Metrics API
    if (url.pathname === '/api/admin/orders' && request.method === 'GET') {
      const verifiedOrders = seedOrders.filter(o => o.status === 'verified');
      const totalRevenuePKR = verifiedOrders.reduce((sum, o) => sum + (o.totalAmountPKR || 0), 0);
      const pendingCount = seedOrders.filter(o => o.status === 'pending').length;
      const verifiedCount = verifiedOrders.length;

      return new Response(
        JSON.stringify({
          success: true,
          orders: seedOrders,
          stats: {
            totalOrders: seedOrders.length,
            pendingCount,
            pendingOrders: pendingCount,
            verifiedCount,
            verifiedOrders: verifiedCount,
            totalRevenuePKR,
          },
          notifications: seedNotifications,
        }),
        { headers: corsHeaders }
      );
    }

    // 3. Notes List API
    if (url.pathname === '/api/notes' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          notes: seedNotes,
        }),
        { headers: corsHeaders }
      );
    }

    // 4. Site Settings API
    if (url.pathname === '/api/settings' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          settings: seedSettings,
        }),
        { headers: corsHeaders }
      );
    }

    // Return static assets
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  },
};
