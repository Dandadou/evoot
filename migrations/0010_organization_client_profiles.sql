PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS organization_client_profiles (
  organization_id TEXT PRIMARY KEY,
  legal_name TEXT,
  contact_name TEXT,
  contact_title TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province_state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Canada',
  neq TEXT,
  tax_gst_number TEXT,
  tax_qst_number TEXT,
  billing_email TEXT,
  billing_contact_name TEXT,
  billing_phone TEXT,
  billing_address_same INTEGER NOT NULL DEFAULT 1,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_province_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  internal_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_org_client_profile_email ON organization_client_profiles(contact_email);
CREATE INDEX IF NOT EXISTS idx_org_client_profile_legal_name ON organization_client_profiles(legal_name);
