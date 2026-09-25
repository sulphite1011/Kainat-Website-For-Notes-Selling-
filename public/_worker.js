export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API Routes for Cloudflare Workers
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
            {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid credentials. Username or password incorrect.',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return static assets
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  },
};
