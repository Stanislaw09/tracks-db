-- SQL schema for the tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    soundcloud_url TEXT NOT NULL,
    album_image_url TEXT NOT NULL
);