#!/usr/bin/env node
/**
 * pit-fundamentals-mcp — company fundamentals from official filings, dated by
 * filing, for any MCP client.
 *
 * The user never sees an API at all. They ask
 * "what was Apple's revenue as of the start of 2022?" and the assistant
 * fetches figures that each carry their filing date as each market records
 * it, and the `as_of` parameter filters to `filed <= as_of`.
 *
 * Auth: TRADINGAGENT_API_KEY, or the literal "demo" key, which needs no
 * signup and covers every company at its most recent reported fiscal year,
 * plus full history for a sample set (call get_coverage for the current list
 * rather than trusting a number here). Data on the demo key is supplied under
 * the Trading Agent Data Free Licence (https://www.tradingagentapp.com/licences/free);
 * using it means you accept that licence.
 */
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { readFileSync } from "node:fs";
import { registerTools, recentRowsPerMetric, KNOWN_ISSUES } from "./tools.js";

// The tests import these from here.
export { recentRowsPerMetric, KNOWN_ISSUES };

/** Read from the manifest rather than repeated here. A second copy drifts:
 *  the handshake was still announcing 0.2.0 after the package became 0.3.0,
 *  so a client could not tell which market semantics it was talking to. */
const VERSION = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
).version;
/** An empty (or blank) variable counts as not set. An MCP client config that
 *  carries "TRADINGAGENT_API_KEY": "" (an install form whose optional key
 *  field was left blank) used to send "Bearer " with no key, and the API
 *  refused every tool call; now it gets the demo key, as when unset. */
const fromEnv = (name, fallback) => (process.env[name] ?? "").trim() || fallback;
const BASE = fromEnv("TRADINGAGENT_BASE_URL", "https://www.tradingagentapp.com/api/v1");
const KEY = fromEnv("TRADINGAGENT_API_KEY", "demo");
const UA = `pit-fundamentals-mcp/${VERSION}`;

async function api(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${KEY}`, "User-Agent": UA },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

/** Built per connection, NOT once at module scope. serveStdio may call this
 *  factory more than once: when a client opens with the modern
 *  `server/discover` and then initialises with the 2025-era handshake, the SDK
 *  closes the probe instance and asks for a fresh one. Handing it a singleton
 *  returns the already-closed instance, and the client sees a server that
 *  advertises tools during discovery and then refuses to initialise. */
function createServer() {
  const server = new McpServer({ name: "pit-fundamentals", version: VERSION });
  registerTools(server, {
    z,
    api,
    search: async ({ query, market }) => {
      const qs = new URLSearchParams({ q: query, ...(market ? { market } : {}) });
      const res = await fetch(
        `${BASE.replace(/\/api\/v1$/, "")}/api/search?${qs}`,
        { headers: { "User-Agent": UA } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });
  return server;
}

// Tests import this module for recentRowsPerMetric without starting a server.
if (process.env.PIT_FUNDAMENTALS_MCP_NO_SERVE !== "1") serveStdio(() => createServer());
