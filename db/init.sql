BEGIN;

CREATE TABLE IF NOT EXISTS message (
  id SERIAL PRIMARY KEY,
  pseudo TEXT    NOT NULL,
  contenu TEXT   NOT NULL,
  date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO message (pseudo, contenu) VALUES
  ('Paul',   'Bonjour, ceci est un message de test !'),
  ('Clément',     'Voici un autre message.'),
  ('Marine', 'Test de la table message.');
  ('Antoine', 'Salut, comment ça va ?'),
  ('Corentin', 'Ceci est un message de test.'),

-- docker exec -i forum-db psql -U forum_user -d forum_db < db/init_seed.sql
-- Get-Content .\init.sql | docker exec -i forum-db psql -U forum_user -d forum_db