-- UUID 支持
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 地理位置（Phase 3 用）
CREATE EXTENSION IF NOT EXISTS postgis;

-- 全文搜索（可选）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT NOT NULL,

    preferred_languages TEXT[] DEFAULT ARRAY['en'],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title TEXT NOT NULL,
    subtitle TEXT,

    original_language TEXT, -- ISO 639-1

    description JSONB, -- { "en": "...", "zh": "..." }

    categories TEXT[],
    tags TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_books_title ON books USING GIN (title gin_trgm_ops);

CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    bio TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE book_authors (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'author', -- author / translator / editor

    PRIMARY KEY (book_id, author_id, role)
);

CREATE INDEX idx_authors_name ON authors USING GIN (name gin_trgm_ops);

CREATE TABLE editions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    book_id UUID REFERENCES books(id) ON DELETE CASCADE,

    isbn_10 TEXT,
    isbn_13 TEXT UNIQUE,

    language TEXT, -- ISO 639-1
    publisher TEXT,
    publication_date DATE,

    format TEXT, -- hardcover / paperback / ebook

    page_count INT,

    cover_url TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_editions_book_id ON editions(book_id);
CREATE INDEX idx_editions_isbn ON editions(isbn_13);

CREATE TABLE user_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,

    status TEXT CHECK (status IN ('unread', 'reading', 'read')) DEFAULT 'unread',

    condition INT CHECK (condition BETWEEN 1 AND 5),

    location_text TEXT,
    location_geo GEOGRAPHY(POINT, 4326),

    exchangeable BOOLEAN DEFAULT FALSE,

    visibility TEXT DEFAULT 'private', -- private / friends / public

    user_cover TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_books_user ON user_books(user_id);
CREATE INDEX idx_user_books_edition ON user_books(edition_id);
CREATE INDEX idx_user_books_geo ON user_books USING GIST(location_geo);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_book_id UUID REFERENCES user_books(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    page INT,

    visibility TEXT DEFAULT 'private',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notes_user_book ON notes(user_book_id);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,

    rating INT CHECK (rating BETWEEN 1 AND 5),
    content TEXT,

    visibility TEXT DEFAULT 'public',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, book_id)
);

CREATE INDEX idx_reviews_book ON reviews(book_id);

CREATE TABLE exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    requester_id UUID REFERENCES users(id),
    owner_id UUID REFERENCES users(id),

    user_book_id UUID REFERENCES user_books(id) ON DELETE CASCADE,

    status TEXT CHECK (
        status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')
    ) DEFAULT 'pending',

    meeting_location GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exchanges_requester ON exchanges(requester_id);
CREATE INDEX idx_exchanges_owner ON exchanges(owner_id);

CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    from_user UUID REFERENCES users(id),
    to_user UUID REFERENCES users(id),

    exchange_id UUID REFERENCES exchanges(id),

    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (from_user, exchange_id)
);

-- Book 全文搜索字段（可后期加）
ALTER TABLE books ADD COLUMN tsv tsvector;

CREATE INDEX idx_books_tsv ON books USING GIN(tsv);

-- 更新触发器（简化版）
CREATE FUNCTION books_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv :=
    to_tsvector('simple',
      coalesce(NEW.title,'') || ' ' ||
      coalesce(NEW.subtitle,'')
    );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsv_update BEFORE INSERT OR UPDATE
ON books FOR EACH ROW EXECUTE FUNCTION books_tsv_trigger();

