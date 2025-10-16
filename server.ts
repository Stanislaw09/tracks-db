import {Client} from 'postgres';
import {serve} from 'std/http';


async function getDbPassword() {
  const passFile = Deno.env.get('DB_PASS_FILE');
  if (passFile) {
    return (await Deno.readTextFile(passFile)).trim();
  }
  return Deno.env.get('DB_PASS');
}

const sql = new Client({
  user: Deno.env.get('DB_USER'),
  password: await getDbPassword(),
  database: Deno.env.get('DB_NAME') || 'tracksdb',
  hostname: Deno.env.get('DB_HOST') || 'localhost',
  port: 5432,
});

async function connect(client, retries = 10, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      console.log('Connected to database');
      return;
    } catch (err) {
      console.error(`DB connection failed (attempt ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error('Could not connect to database after multiple attempts');
}

await connect(sql);

serve(
  async (req: Request) => {
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/tracks') {
      const result = await sql.queryObject('SELECT * FROM tracks');
      return new Response(JSON.stringify(result.rows), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    }

    if (req.method === 'POST' && url.pathname === '/tracks') {
      const {title, author, soundcloud_url, album_image_url} = await req.json();
      await sql.queryObject(
        'INSERT INTO tracks (title, author, soundcloud_url, album_image_url) VALUES ($1, $2, $3, $4)',
        [title, author, soundcloud_url, album_image_url]
      );
      return new Response('Track added', {status: 201});
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/tracks/')) {
      const id = url.pathname.split('/')[2];
      await sql.queryObject('DELETE FROM tracks WHERE id = $1', [id]);
      return new Response('Track deleted', {status: 200});
    }

    if (req.method === 'GET' && url.pathname === '/') {
      return new Response('hello from deno server bro');
    }

    return new Response('Not found', {status: 404});
  },
  {port: 8000}
);
