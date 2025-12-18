import { createClient } from '@vercel/kv';

// FALLBACK STORAGE (RAM)
if (!global._tempStorage) {
    global._tempStorage = null;
}

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Kv-Url, X-Kv-Token');
  
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).json({});
  }

  // 1. Tự động dò tìm biến môi trường (Auto-Discovery Env Vars)
  // Vercel có thể đặt tên là KV_REST_API_URL hoặc STORAGE_REST_API_URL tùy vào lúc Connect
  let kvUrl = process.env.KV_REST_API_URL;
  let kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
      // Quét tất cả biến môi trường để tìm cặp _REST_API_URL và _REST_API_TOKEN
      for (const key in process.env) {
          if (key.endsWith('_REST_API_URL')) {
              const prefix = key.substring(0, key.length - '_REST_API_URL'.length); // Ví dụ: "STORAGE" hoặc "MY_DB"
              const tokenKey = `${prefix}_REST_API_TOKEN`;
              if (process.env[tokenKey]) {
                  console.log(`[Server] Found Database Config: ${prefix}`);
                  kvUrl = process.env[key];
                  kvToken = process.env[tokenKey];
                  break;
              }
          }
      }
  }

  // 2. Nếu vẫn không có, thử lấy từ Header (Cấu hình thủ công từ Frontend)
  if (!kvUrl || !kvToken) {
      kvUrl = request.headers['x-kv-url'];
      kvToken = request.headers['x-kv-token'];
  }

  const hasKV = !!(kvUrl && kvToken);
  let kv = null;

  if (hasKV) {
      try {
          kv = createClient({
              url: kvUrl,
              token: kvToken,
          });
      } catch (e) {
          console.error("Init KV Client Failed", e);
      }
  } else {
      console.warn("⚠️ KV Config Missing (No Env, No Headers). Using In-Memory Fallback.");
  }

  try {
    if (request.method === 'GET') {
      let data = null;
      if (kv) {
          try {
            data = await kv.get('TOURNAMENT_DATA');
          } catch(err) {
            console.error("KV GET Error", err);
            data = global._tempStorage;
          }
      } else {
          data = global._tempStorage;
      }
      
      const result = data || {};
      return response.status(200).json({
          ...result,
          _serverMode: kv ? 'real-db' : 'temporary-memory',
          _kvSource: (process.env.KV_REST_API_URL ? 'env' : (request.headers['x-kv-url'] ? 'header' : 'none'))
      });
    } 
    
    if (request.method === 'POST') {
      let body = request.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { return response.status(400).json({ error: 'Invalid JSON' }); }
      }

      if (!body || !body.categories) {
         return response.status(400).json({ error: 'Invalid Data Structure' });
      }

      if (kv) {
          try {
            await kv.set('TOURNAMENT_DATA', body);
          } catch(err) {
             console.error("KV SET Error", err);
             global._tempStorage = body; 
          }
      } else {
          global._tempStorage = body;
      }

      return response.status(200).json({ 
          success: true, 
          timestamp: Date.now(),
          _serverMode: kv ? 'real-db' : 'temporary-memory'
      });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("Server Error:", error);
    return response.status(500).json({ error: error.message });
  }
}