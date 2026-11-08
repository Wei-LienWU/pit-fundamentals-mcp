# pit-fundamentals-mcp

Company financials from official filings, as MCP tools, with **the filing
date on every figure**. About 4.2 million entities in 12 markets, most of
them private companies: the company registers of France, Belgium, Denmark,
Sweden, Estonia, Latvia and Slovakia, plus the United States (SEC EDGAR),
Japan (FSA EDINET), Korea (FSS OpenDART), Taiwan (TWSE) and New Zealand
registered charities.

```
"What was Apple's revenue as of the start of 2022?"
→ 365,817,000,000 USD, filed 2021-10-29
```

With a key, `as_of` returns only the filings dated on or before a chosen
day, so a backtest or a credit review sees what was on file at the time.

> **Code and data are licensed separately.** The code in this repository is
> MIT licensed (see [LICENSE](LICENSE)). The data the server returns is
> **not** covered by the MIT licence: it is supplied under the
> [Trading Agent Data licences](https://www.tradingagentapp.com/licences)
> and each source's terms. Data served on the demo key is supplied under the
> [Trading Agent Data Free Licence](https://www.tradingagentapp.com/licences/free);
> using it means you accept that licence. See [Data licence](#data-licence).

## Two ways to connect

| | How | Install |
| --- | --- | --- |
| Remote server (Streamable HTTP) | `https://www.tradingagentapp.com/api/mcp` | nothing |
| Local server (stdio, Node.js 20 or later) | `npx -y pit-fundamentals-mcp` | npm package [pit-fundamentals-mcp](https://www.npmjs.com/package/pit-fundamentals-mcp) |

Both serve the same five read-only tools. Without a key, both answer on the
demo key: every company at its most recent reported fiscal year, all
fields, and about 60 named companies with full history as a worked sample.
No sign-up needed.

### Client config: remote server

Claude Desktop, Cursor and other clients that take a `mcpServers` list:

```json
{
  "mcpServers": {
    "pit-fundamentals": {
      "url": "https://www.tradingagentapp.com/api/mcp"
    }
  }
}
```

With a key, send it as a bearer token:

```json
{
  "mcpServers": {
    "pit-fundamentals": {
      "url": "https://www.tradingagentapp.com/api/mcp",
      "headers": { "Authorization": "Bearer ta_live_..." }
    }
  }
}
```

Claude Code:

```bash
claude mcp add --transport http pit-fundamentals https://www.tradingagentapp.com/api/mcp
```

Claude.ai and ChatGPT: add a custom connector (Claude: Settings → Connectors
→ Add custom connector; ChatGPT: Settings → Apps → Advanced settings,
developer mode) with the URL above. These screens take a URL only, so they
answer on the demo key; to use your own key, use Claude Code, Cursor or the
local server.

### Client config: local server

Add this to the client's `mcpServers` list (Claude Desktop:
`claude_desktop_config.json`; Cursor: `~/.cursor/mcp.json`), then restart
the client:

```json
{
  "mcpServers": {
    "pit-fundamentals": {
      "command": "npx",
      "args": ["-y", "pit-fundamentals-mcp"],
      "env": { "TRADINGAGENT_API_KEY": "" }
    }
  }
}
```

Leave `TRADINGAGENT_API_KEY` empty (or leave it out) for the demo key, or
paste your key (`ta_live_...`).

Claude Code:

```bash
claude mcp add pit-fundamentals -- npx -y pit-fundamentals-mcp
claude mcp add pit-fundamentals -e TRADINGAGENT_API_KEY=ta_live_... -- npx -y pit-fundamentals-mcp
```

## Keys

- **Demo key**: used automatically when no key is set. Every company at its
  most recent reported fiscal year.
- **Account key** (no payment details):
  <https://www.tradingagentapp.com/account/api-keys>. Every company's latest
  fiscal year.
- **30-day evaluation key** (work email, internal evaluation only, up to
  1,000 entities): full history and `as_of`.
  <https://www.tradingagentapp.com/fundamentals/evaluate>
- **Licence**: full history and `as_of`; bulk files come with the
  Redistribution Licence. <https://www.tradingagentapp.com/fundamentals>

## Try these prompts

All five work on the demo key:

1. "Which markets do you cover, and how many companies in each?"
2. "What was LEGO A/S's revenue in its latest annual report, and when was it filed?"
3. "Show Apple's annual revenue and net income since 2021, with the date each 10-K was filed."
4. "Look up Toyota Motor in Japan: latest annual revenue and net income, with the filing date."
5. "What were Samsung Electronics' operating income and net income for 2025, and when was the report filed?"

## Tools

| Tool | What it does |
| --- | --- |
| `search_companies` | find a ticker from a name ("Apple", "TSMC", "samsung", "2330"); optional `market` |
| `get_latest_fundamentals` | most recent value of each metric (or only those named in `metric`), with its period (`fy`, `fp`), filing date and form, optionally as of a date |
| `get_fundamentals_history` | reported figures with their period and filing date; capped at 250 rows, keeping the most recent rows of every metric |
| `get_coverage` | markets, entity counts, history depth, metrics, attributions and licence |
| `get_data_dictionary` | what each detailed line item means per market, and the share of company-periods that carry it |

All five are read-only. Dates (`as_of`, `from`) are written `YYYY-MM-DD`.
Every data reply carries the `attribution` and `licence` notices, the
company's register entry (`company`), and `full_history` /
`history_depth`, which say whether the reply is the company's whole record
or its latest fiscal year only.

Tickers look like `AAPL` (US), `E00414.JP` (Japan, the EDINET code),
`2330.TW` (Taiwan), `005930.KS` (Korea), `775670417.FR` (France, the SIREN),
`0403091220.BE` (Belgium, the KBO enterprise number), `35651594.DK`
(Denmark, the CVR number) and `CC21860.NZC` (New Zealand registered
charities).

## Data notes

- `fp` is `FY` for an annual row. For a quarterly row (US, Taiwan), `fy` and
  `fp` are the calendar year and quarter that contain the period end, not
  the company's own fiscal quarter.
- Taiwan income-statement figures are single-quarter amounts; do not
  difference adjacent quarters again. Taiwan filing dates are the statutory
  reporting deadline, a proxy for the release date. Known issue, being
  corrected: for some financial and foreign first-listed companies, and for
  weekend deadlines, the date can be earlier than the real deadline.
- Belgian figures are statutory solo accounts, not group consolidation.
- New Zealand figures are registered charities, not companies. A missing
  figure means not stated, never zero.
- How each market dates a filing, and the known issues of each market, are
  on the [methodology page](https://www.tradingagentapp.com/fundamentals/methodology).
- Factual historical data only. Not investment advice, not a recommendation.

## Data licence

This repository's code is MIT licensed. **The data is not.** The data the
tools return is supplied under the
[Trading Agent Data licences](https://www.tradingagentapp.com/licences) and
the source registers' terms. The source attribution notices returned with
each response are a condition of the grant for Taiwan, Japan, France and New
Zealand, among others: keep them with the data.

Sources: US SEC EDGAR · Financial Services Agency, EDINET (Japan) · Korea
FSS OpenDART · Taiwan Stock Exchange (TWSE OpenAPI and MOPS XBRL archive) ·
INPI, Registre national des entreprises (France) · National Bank of
Belgium, Central Balance Sheet Office · Danish Business Authority · Swedish
Companies Registration Office (Bolagsverket) · Estonian e-Business Register
· Slovak Register of Financial Statements (RÚZ) · Latvian Register of
Enterprises · Charities Services, Department of Internal Affairs (New
Zealand).

Full documentation: <https://www.tradingagentapp.com/developers#mcp>

## Questions

Email william@tradingagentapp.com. Issues are disabled on this repository.

---

Operated by WU Capital Limited.

WU Capital Limited is a member of the NVIDIA Inception program.

NVIDIA, the NVIDIA logo, and NVIDIA Inception are trademarks and/or
registered trademarks of NVIDIA Corporation in the U.S. and other countries.
