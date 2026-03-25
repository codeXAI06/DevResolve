CREATE TABLE IF NOT EXISTS doubt_tags (
    doubt_id VARCHAR(255) NOT NULL,
    tag_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (doubt_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_doubt_tags_doubt_id ON doubt_tags (doubt_id);
CREATE INDEX IF NOT EXISTS idx_doubt_tags_tag_id ON doubt_tags (tag_id);
