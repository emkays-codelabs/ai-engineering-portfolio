-- NEXORA AI Support Copilot — Knowledge Collections
-- Adds the knowledge_collections table referenced by
-- backend/app/repositories/knowledge_repo.py (KnowledgeCollectionRepository)
-- and exposed via GET/POST /api/v1/knowledge/collections.
-- This table was missing from 001_initial_schema.sql even though the
-- application code has depended on it since the knowledge base feature shipped.

CREATE TABLE knowledge_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    document_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_knowledge_collections_tenant ON knowledge_collections(tenant_id);
CREATE INDEX idx_knowledge_collections_created ON knowledge_collections(created_at DESC);

ALTER TABLE knowledge_collections ENABLE ROW LEVEL SECURITY;
