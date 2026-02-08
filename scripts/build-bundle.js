#!/usr/bin/env node

/**
 * Build the aggregated bundle.json from individual server definitions.
 *
 * Reads all servers/*.json and categories.json, enriches each server with
 * platform-inferred fields, and writes bundle/bundle.json.
 */

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

const ROOT = path.resolve(__dirname, "..");
const SERVERS_DIR = path.join(ROOT, "servers");
const CATEGORIES_PATH = path.join(ROOT, "categories.json");
const BUNDLE_DIR = path.join(ROOT, "bundle");
const BUNDLE_PATH = path.join(BUNDLE_DIR, "bundle.json");

const BUNDLE_VERSION = "2.1.0";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

async function getAllServerFiles() {
  const pattern = path.join(SERVERS_DIR, "*.json").replace(/\\/g, "/");
  const files = await glob(pattern);
  return files.map((f) => path.resolve(f));
}

/**
 * Enrich a server definition with platform-inferred fields.
 */
function enrichServer(server) {
  const enriched = { ...server };
  const now = new Date().toISOString();

  // badges: ["official"] if publisher.official === true, else []
  if (server.publisher && server.publisher.official === true) {
    enriched.badges = ["official"];
  } else {
    enriched.badges = [];
  }

  // hosting_type: infer from transport type
  if (server.transport && server.transport.type === "stdio") {
    enriched.hosting_type = "local";
  } else if (server.transport && server.transport.type === "http") {
    enriched.hosting_type = "remote";
  } else {
    enriched.hosting_type = "local"; // default
  }

  // timestamps
  enriched.timestamps = {
    created_at: now,
    updated_at: now,
  };

  return enriched;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Load categories
  let categories;
  try {
    categories = loadJson(CATEGORIES_PATH);
  } catch (err) {
    console.error(`Failed to load categories.json: ${err.message}`);
    process.exit(1);
  }

  // Load and enrich server definitions
  const serverFiles = await getAllServerFiles();
  const servers = [];

  for (const filePath of serverFiles) {
    const relative = path.relative(ROOT, filePath);
    try {
      const data = loadJson(filePath);
      const enriched = enrichServer(data);
      servers.push(enriched);
      console.log(`  Loaded: ${relative}`);
    } catch (err) {
      console.error(`  ERROR loading ${relative}: ${err.message}`);
      process.exit(1);
    }
  }

  // Sort servers by name for consistent output
  servers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  // Determine which categories are actually used by servers
  const usedCategories = new Set();
  for (const s of servers) {
    for (const c of s.categories || []) {
      usedCategories.add(c);
    }
  }

  // Build featured server IDs (official + verified publishers, up to 6)
  const featuredIds = servers
    .filter((s) => s.publisher && s.publisher.official && s.publisher.verified)
    .slice(0, 6)
    .map((s) => s.id);

  // Build the bundle (matches RegistryBundle TypeScript type in API)
  const bundle = {
    version: BUNDLE_VERSION,
    updated_at: new Date().toISOString(),
    servers,
    categories,
    ui: {
      filters: [
        {
          id: "category",
          label: "Category",
          type: "single",
          options: [
            { id: "all", label: "All Categories" },
            ...categories
              .filter((c) => usedCategories.has(c.id))
              .map((c) => ({
                id: c.id,
                label: c.name,
                icon: c.icon,
                match: {
                  field: "categories",
                  operator: "contains",
                  value: c.id,
                },
              })),
          ],
        },
        {
          id: "publisher",
          label: "Publisher",
          type: "single",
          options: [
            { id: "all", label: "All Publishers" },
            {
              id: "official",
              label: "Official",
              match: {
                field: "publisher.official",
                operator: "eq",
                value: true,
              },
            },
            {
              id: "verified",
              label: "Verified",
              match: {
                field: "publisher.verified",
                operator: "eq",
                value: true,
              },
            },
          ],
        },
        {
          id: "transport",
          label: "Transport",
          type: "single",
          options: [
            { id: "all", label: "All" },
            {
              id: "http",
              label: "Remote (HTTP)",
              match: {
                field: "transport.type",
                operator: "eq",
                value: "http",
              },
            },
            {
              id: "stdio",
              label: "Local (Stdio)",
              match: {
                field: "transport.type",
                operator: "eq",
                value: "stdio",
              },
            },
          ],
        },
        {
          id: "auth",
          label: "Auth Required",
          type: "single",
          options: [
            { id: "all", label: "All" },
            {
              id: "none",
              label: "No Auth",
              match: { field: "auth.type", operator: "eq", value: "none" },
            },
            {
              id: "api_key",
              label: "API Key",
              match: { field: "auth.type", operator: "eq", value: "api_key" },
            },
            {
              id: "oauth",
              label: "OAuth",
              match: { field: "auth.type", operator: "eq", value: "oauth" },
            },
          ],
        },
      ],
      sort_options: [
        {
          id: "recommended",
          label: "Recommended",
          rules: [
            { field: "publisher.official", direction: "desc", nulls: "last" },
            { field: "publisher.verified", direction: "desc", nulls: "last" },
            { field: "name", direction: "asc" },
          ],
        },
        {
          id: "name_asc",
          label: "Name A-Z",
          rules: [{ field: "name", direction: "asc" }],
        },
        {
          id: "name_desc",
          label: "Name Z-A",
          rules: [{ field: "name", direction: "desc" }],
        },
      ],
      default_sort: "recommended",
      items_per_page: 24,
    },
    home: {
      featured_server_ids: featuredIds,
    },
  };

  // Ensure bundle directory exists
  if (!fs.existsSync(BUNDLE_DIR)) {
    fs.mkdirSync(BUNDLE_DIR, { recursive: true });
  }

  // Write bundle
  fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundle, null, 2) + "\n", "utf-8");

  console.log(
    `\nBundle written to bundle/bundle.json (${servers.length} server(s), ${categories.length} categories)`
  );
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
