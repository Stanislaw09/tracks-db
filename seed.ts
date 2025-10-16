import {Client} from 'postgres';
import 'jsr:@std/dotenv/load.ts';

const sql = new Client({
  user: Deno.env.get('DB_USER'),
  password: Deno.env.get('DB_PASS'),
  database: Deno.env.get('DB_NAME'),
  hostname: Deno.env.get('DB_HOST'),
  port: 5432,
});

await sql.connect();

const data = JSON.parse(await Deno.readTextFile("tracks.json"));

// clear db
await sql.queryObject('TRUNCATE TABLE tracks RESTART IDENTITY;');

// inserts tracks
for (const track of data) {
  await sql.queryObject(
    `INSERT INTO tracks (title, author, soundcloud_url, album_image_url) VALUES ($1, $2, $3, $4)`,
    [track.title, track.author, track.soundcloud_url, track.album_image_url]
  );
}

console.log('Seed complete: sample tracks inserted.');
await sql.end();
