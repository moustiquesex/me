CREATE TABLE counts (slug TEXT PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0 CHECK(total >= 0));
CREATE TABLE reactions (
  slug TEXT NOT NULL REFERENCES counts(slug),
  voter TEXT NOT NULL,
  expires INTEGER NOT NULL,
  PRIMARY KEY(slug, voter)
);
CREATE INDEX reactions_expiry ON reactions(expires);
CREATE TRIGGER add_reaction AFTER INSERT ON reactions BEGIN
  UPDATE counts SET total = total + 1 WHERE slug = NEW.slug;
END;
CREATE TRIGGER remove_reaction AFTER DELETE ON reactions BEGIN
  UPDATE counts SET total = total - 1 WHERE slug = OLD.slug;
END;
CREATE TABLE limits (key TEXT PRIMARY KEY, n INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX limits_expiry ON limits(expires);
