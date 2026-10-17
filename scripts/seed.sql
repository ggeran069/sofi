-- Idempotent seed data (mirrors src/lib/db/setup.ts).
-- Safe to re-run: INSERT OR IGNORE skips rows whose PK/unique keys already exist.
-- IDs are fixed UUIDs so foreign keys stay stable and re-runs are no-ops.
-- Apply with:
--   npx wrangler d1 execute sofi-db --remote --file=scripts/seed.sql -y
--   npx wrangler d1 execute sofi-db --local  --file=scripts/seed.sql -y

-- Admin login: admin@sofia.com / changeme123 (change after first login)
INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES
  ('968538a7-7a0e-420c-b172-74aa6d3ee581', 'admin@sofia.com', '$2a$12$ZGPYITBndT9FT2pOo6wEOugSDszKzxKClbV.yqLfU9dDj4KCtkcqm', 'Admin', 'admin');

INSERT OR IGNORE INTO categories (id, name, slug, description, sort_order) VALUES
  ('e12ef49d-c57d-42bf-b8c9-60f9a03e6f1f', 'Fashion', 'fashion', 'Fashion styling and editorial work', 0),
  ('c0c867de-9b5d-4b85-b69f-91e1dc4df587', 'Video', 'video', 'Music videos, commercials, and motion', 1),
  ('d049eedc-9df3-4c42-97d0-ca97fe821221', 'Design', 'design', 'Art direction and creative design', 2);

INSERT OR IGNORE INTO settings (id, key, value) VALUES
  ('b1e9a71a-f874-49e0-b03a-934b9790ec6d', 'site_name', 'SOFIA'),
  ('a711fafb-4826-4a98-b562-6a2af669d144', 'tagline', 'STYLING, DESIGN, ART DIRECTION'),
  ('7dc5e115-b6c9-4d6e-87af-e1bf06cda201', 'bio', 'Sofia is a creative director and stylist based in Athens, working across fashion editorial, brand identity, and visual storytelling.'),
  ('dd4bf5e4-d171-4678-a8cb-d9a70b323ce3', 'profile_image_url', 'https://picsum.photos/seed/sofia-profile/600/800'),
  ('90fa8f52-8f94-45fe-8d72-1e95d33259a4', 'instagram', 'https://instagram.com/sofia'),
  ('45af37cf-0452-44db-a60e-b8fa3327d916', 'tiktok', 'https://tiktok.com/@sofia'),
  ('4acdb116-8973-4451-9214-eef3c8154e89', 'email', 'hello@sofia.com'),
  ('081993ac-9737-4ce7-8c7d-41dfbafdf3d6', 'phone', '+30 210 000 0000'),
  ('2247ffb0-82a2-4276-8170-2d4daea1be94', 'location', 'Athens, Greece');

INSERT OR IGNORE INTO content_items (id, title, slug, description, long_description, category_id, status, featured, thumbnail_url, sort_order, metadata) VALUES
  ('b676e7cf-b6ec-4a74-8e09-4d5018a3ce0e', 'Ancient Greek Sandals', 'ancient-greek-sandals',
    'Editorial campaign for Ancient Greek Sandals SS25 collection.',
    'A sun-drenched editorial capturing the essence of Mediterranean summer.',
    'e12ef49d-c57d-42bf-b8c9-60f9a03e6f1f', 'published', 1, 'https://picsum.photos/seed/ags/800/1200', 0, '{}'),
  ('4d230e3b-0a43-4ac8-baf8-1c9cfa9e7bd3', 'Kennedy Magazine — Cameron Kendrick', 'kennedy-magazine-cameron-kendrick',
    'Editorial feature in Kennedy Magazine.',
    'An exploration of masculinity and vulnerability.',
    'e12ef49d-c57d-42bf-b8c9-60f9a03e6f1f', 'published', 1, 'https://picsum.photos/seed/kennedy/800/600', 1, '{}'),
  ('1f92a0a9-6490-4c1c-9d5b-031415ecb9c4', 'Athens Kallithea FC', 'athens-kallithea-fc',
    'Brand identity and creative direction for Athens Kallithea FC.',
    NULL, 'd049eedc-9df3-4c42-97d0-ca97fe821221', 'published', 0, 'https://picsum.photos/seed/akfc/800/1000', 0, '{}'),
  ('daf515a1-22ec-4e5d-a521-e46572656f6a', 'Adidas Tennis — Serve & Return', 'adidas-tennis-serve-return',
    'Campaign styling for Adidas Tennis spring/summer collection.',
    NULL, 'e12ef49d-c57d-42bf-b8c9-60f9a03e6f1f', 'published', 0, 'https://picsum.photos/seed/adidas/800/700', 2, '{}'),
  ('42d7380e-f3d8-4930-aeae-5a84c82540cf', 'Monolith — Music Video', 'monolith-music-video',
    'Creative direction and styling for Monolith''s latest music video.',
    NULL, 'c0c867de-9b5d-4b85-b69f-91e1dc4df587', 'published', 0, 'https://picsum.photos/seed/monolith/800/500', 0, '{}'),
  ('8cbe1906-b9f2-4140-ba3e-f302f2f66515', 'Atelier Nomad — Visual Identity', 'atelier-nomad-visual-identity',
    'Brand identity and packaging design for Atelier Nomad.',
    NULL, 'd049eedc-9df3-4c42-97d0-ca97fe821221', 'draft', 0, 'https://picsum.photos/seed/nomad/800/900', 1, '{}');

INSERT OR IGNORE INTO content_images (id, content_item_id, url, alt, sort_order) VALUES
  ('eb05cfa5-7aa4-4836-997c-25fc4d9242fd', 'b676e7cf-b6ec-4a74-8e09-4d5018a3ce0e', 'https://picsum.photos/seed/ancient-greek-sandals-0/800/600', 'Ancient Greek Sandals - Image 1', 0),
  ('097bd354-07c9-420d-bc15-a8c32de412d1', 'b676e7cf-b6ec-4a74-8e09-4d5018a3ce0e', 'https://picsum.photos/seed/ancient-greek-sandals-1/900/700', 'Ancient Greek Sandals - Image 2', 1),
  ('d0b13b7d-8fd9-4791-9ea5-a7e7abc30521', '4d230e3b-0a43-4ac8-baf8-1c9cfa9e7bd3', 'https://picsum.photos/seed/kennedy-magazine-cameron-kendrick-0/800/600', 'Kennedy Magazine — Cameron Kendrick - Image 1', 0),
  ('11b82d56-f1a9-483b-b896-a1f28950abe6', '4d230e3b-0a43-4ac8-baf8-1c9cfa9e7bd3', 'https://picsum.photos/seed/kennedy-magazine-cameron-kendrick-1/1000/800', 'Kennedy Magazine — Cameron Kendrick - Image 2', 1),
  ('9d054e9c-b294-45b3-8e38-9b7fc3407234', '1f92a0a9-6490-4c1c-9d5b-031415ecb9c4', 'https://picsum.photos/seed/athens-kallithea-fc-0/800/600', 'Athens Kallithea FC - Image 1', 0),
  ('f24d51ad-25b7-4113-9e3e-15acdf53a831', '1f92a0a9-6490-4c1c-9d5b-031415ecb9c4', 'https://picsum.photos/seed/athens-kallithea-fc-1/850/900', 'Athens Kallithea FC - Image 2', 1),
  ('4c58315f-6474-40f9-900c-d481bcaddda5', 'daf515a1-22ec-4e5d-a521-e46572656f6a', 'https://picsum.photos/seed/adidas-tennis-serve-return-0/800/600', 'Adidas Tennis — Serve & Return - Image 1', 0),
  ('6767965f-3932-4333-b5d8-7c7a1211be98', 'daf515a1-22ec-4e5d-a521-e46572656f6a', 'https://picsum.photos/seed/adidas-tennis-serve-return-1/950/700', 'Adidas Tennis — Serve & Return - Image 2', 1),
  ('78f8838e-3b55-4f5b-b1fe-d642510845ab', '42d7380e-f3d8-4930-aeae-5a84c82540cf', 'https://picsum.photos/seed/monolith-music-video-0/800/600', 'Monolith — Music Video - Image 1', 0),
  ('13676fb4-5c7b-4aae-83c2-4cdd3857ac6f', '42d7380e-f3d8-4930-aeae-5a84c82540cf', 'https://picsum.photos/seed/monolith-music-video-1/800/650', 'Monolith — Music Video - Image 2', 1),
  ('09172958-55a6-4fb4-a403-6689735ba5cd', '8cbe1906-b9f2-4140-ba3e-f302f2f66515', 'https://picsum.photos/seed/atelier-nomad-visual-identity-0/800/600', 'Atelier Nomad — Visual Identity - Image 1', 0),
  ('1d367bea-aa77-438b-b315-179b71ebf935', '8cbe1906-b9f2-4140-ba3e-f302f2f66515', 'https://picsum.photos/seed/atelier-nomad-visual-identity-1/880/760', 'Atelier Nomad — Visual Identity - Image 2', 1);
