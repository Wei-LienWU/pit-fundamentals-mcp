/**
 * The tool definitions of pit-fundamentals-mcp: names, descriptions, input
 * schemas and what each tool returns. The same tool definitions serve both
 * the npm package (stdio, index.js) and the remote server at
 * https://www.tradingagentapp.com/api/mcp.
 *
 * No imports, so it runs unchanged in both places: zod, the API call and the
 * company search are handed in by the server that registers the tools.
 */

/** Only get_coverage used to return the API's per-market `notes`, and a model
 *  has no reason to call it before asking for a number. So the caveats that
 *  change what a figure MEANS never reached the assistant that was reading
 *  the figure. These ride with every data response, as `market_notes`
 *  (envelope below, and get_coverage). Until 0.4.1 they were also repeated in
 *  both data tools' descriptions, which made each over 10,000 characters;
 *  the descriptions now keep only the caveats a model needs before calling
 *  (DATA_CAVEATS) and point here. Taiwan is the one a model is most likely to
 *  get wrong: the figures are already single-quarter, and differencing them
 *  again (as Taiwan's own cumulative filings would need) understates every
 *  quarter after Q1. */
export const MARKET_SEMANTICS =
  "Suffixes are not all listed equities, and not all figures mean what the " +
  "column name suggests. .TW income-statement values are SINGLE-QUARTER " +
  "(three-month) amounts: Taiwan files cumulative year-to-date totals and " +
  "they are converted before you see them, so do NOT difference adjacent " +
  "quarters again. A .TW row with fp FY is the full-year total, not a " +
  "quarter. .TW current quarters come from the TWSE OpenAPI (Open " +
  "Government Data License v1.0, attribution required); history from 2013 " +
  "comes from the TWSE MOPS XBRL archive, which is NOT open data: keep both " +
  "attribution notices and do not call Taiwan figures open data. US figures " +
  "(SEC EDGAR) are public information; a US `form` ending /scale-differs-later " +
  "marks a figure that a later 10-K or 10-Q of the company gives for the same period " +
  "about 1,000 or 1,000,000 times larger or smaller (served as filed; the flag " +
  "does not say which filing is wrong, and ratios from it carry it too). " +
  ".TW filing dates are the statutory " +
  "reporting deadline, a proxy, not the actual release date; for some " +
  "financial and foreign first-listed companies and for weekend deadlines " +
  "it can be earlier than the real deadline (known issue, being corrected). " +
  ".BE is Belgian STATUTORY SOLO accounts, never group consolidation. " +
  ".NZC is New Zealand REGISTERED CHARITIES (Charities Register annual " +
  "returns), not companies; their `filed` is the New Zealand date of the " +
  "register's record date when we first stored the return, and a return " +
  "amended later stays as stored. Their assets, liabilities and equity are " +
  "given only where the three balance, about 47% of returns; a missing " +
  "figure means not stated, never zero. .FR is INPI's register of keyed-in " +
  "annual accounts: `filed` is dateDepot, the register's own deposit date, " +
  "and balance sheets are included. Filing dates run from 2017 (about 700 of " +
  "6.2 million filings are dated earlier, the first in December 2012); accounts " +
  "for older fiscal years may carry a 2017 or later date. Turnover is lawfully absent from " +
  "roughly 36% of French deposits (confidentiality declarations); it is " +
  "PRESENT on 64.0% of company-periods, and the API's " +
  "/api/v1/fundamentals/quality endpoint reports the measured share of " +
  "every metric in every market. The " +
  "reporting model rides in `form` (K consolidated, C complet, S simplifie); " +
  "consolidated and own accounts are separate deposits with their own " +
  "dates, so both can appear for one SIREN and period. .DK `filed` is the " +
  "Copenhagen calendar date of the register's publication, a date only " +
  "before 11 April 2015; Danish history starts in June 2012. " +
  ".DK figures are the reporting entity's own accounts: for a Danish-GAAP " +
  "parent that also publishes group accounts, usually its own figures, not " +
  "the group's; for an IFRS filer (form annual/ifrs), the consolidated group's. " +
  ".DK turnover is present on only 10.6% of company-periods " +
  "(Belgium is lower still at 8.1%) because " +
  "Danish reporting class B may publish gross profit instead — that absence " +
  "is lawful disclosure, not missing data, and gross profit is never a " +
  "substitute for it. A .DK `form` is annual (Danish GAAP) or annual/ifrs, " +
  "with the period's length appended when a year is not 11-13 months " +
  "(annual/15m for a long first year); /liquidation marks accounts " +
  "drawn up in liquidation and /correction a period the register holds only as " +
  "a corrected report; /same-as-adjacent, always last, marks both of two " +
  "adjacent annual periods whose figures are identical (the filer may have " +
  "repeated another year's figures; they are served as filed, and the flag does " +
  "not say which period, if either, is wrong); interim reports are excluded. " +
  // Estonia, Sweden, Slovakia and Latvia: served by the API only once live
  // there; the notes below are harmless before then, because no .EE, .SE,
  // .SK or .LV ticker answers.
  ".EE is the Estonian e-Business Register (companies, associations and " +
  "foundations that file an annual report; CC BY 4.0): `filed` is the date " +
  "the register records the report as submitted, an Estonian calendar " +
  "date; figures are the company's own (basis solo) and, where the " +
  "register's key-figure file has them, a consolidated report's group " +
  "figures ride beside them with basis consolidated (form …/consolidated); " +
  "about 1,900 reports, many of them consolidated and among them those of " +
  "banks and listed groups, are not included, because the register, not " +
  "the filer, enters their key figures manually after the report is " +
  "submitted, so the submission date does not date those figures, and some " +
  "companies have no figures here at all (known issue); form annual/pdf " +
  "marks a turnover, assets or employee-count figure taken only from the " +
  "separate boxes the filer keys in (the register's PDF key figures), not " +
  "from the report's statements; a report filed only as a PDF carries just " +
  "those figures; " +
  "employees is in full-time equivalents (unit FTE). .SE is Bolagsverket's " +
  "digitally submitted annual reports from 2020: `filed` is the Sunday " +
  "ending the week (Monday to Sunday) in which the bulk file places the " +
  "report, a proxy for its " +
  "registration date: expected not to be earlier than registration and up " +
  "to six days later, not yet compared report by report with the " +
  "registration date (known issue); liabilities exclude untaxed reserves " +
  "(untaxed_reserves). For .EE and .SE the response's `attributes` gives " +
  "the industry code with its source and date, and for .EE the " +
  "shareholders that are legal persons; natural persons and sole " +
  "proprietors are never included, so that list is never the full " +
  "ownership. With as_of, an attribute known only as of a later date is " +
  "left out and named in attributes.withheld_after_as_of. " +
  "`company.activity_code` is the company's industry code where we hold one " +
  "(.FR APE/NAF, .SE SNI, .EE EMTAK, .SK SK NACE), else null. With as_of it " +
  "is given only where its date is known to be on or before that day (.SE, " +
  ".EE); .FR and .SK codes and every company.address have no known date and " +
  "are null. It describes the legal entity, not its group: " +
  "a French group's parent can carry the head-office code 7010Z, which says " +
  "the company is a head office, not what the group sells. " +
  ".SK is the Slovak Register účtovných závierok (RÚZ, CC0): structured " +
  "statements of companies and other legal persons from financial year " +
  "2019; `filed` is the later of the statement's filing date and the last " +
  "day the register changed the report holding the figures, so never " +
  "before the filing date and usually a day or so after it; micro entities " +
  "(form annual/micro) report revenue as sales of goods plus own products " +
  "and services; IFRS statements filed only as PDF, among them many of the " +
  "largest companies, are not included, nor are banks', insurers', funds' " +
  "and public bodies' statements or single-entry statements. .LV is the " +
  "Latvian Register of " +
  "Enterprises' annual-report data (CC0), financial periods ending 2020 or " +
  "later: the files state no filing date, so `filed` is the Riga calendar " +
  "date the register's data record of the report was created, a proxy read " +
  "as UTC (the register's own files indicate Riga local time, so it can be " +
  "one day later than the record's creation, never earlier), which can be later than the filing, by an amount the files do " +
  "not show, and as far as we know never earlier; the files do not show " +
  "changes, so a report changed before we first collected it is held in " +
  "its changed version; " +
  "associations and foundations are not included. Natural persons who are " +
  "entrepreneurs are never included for either. " +
  ".AU is Australia (ticker = ABN + .AU): official income figures for large " +
  "corporate tax entities from the Australian Taxation Office's Corporate Tax " +
  "Transparency reports (CC BY 3.0 AU), only tax_total_income, " +
  "tax_taxable_income and tax_payable. These are tax return figures, not " +
  "accounts: total income is not revenue and there is no balance sheet. " +
  "`filed` is the date the ATO's file for that income year was public, not a " +
  "filing date; a blank taxable income or tax payable is not zero. The API's " +
  "index lists Australia under `also`, beside `coverage`. " +
  "Period labels: fp is FY for an annual row; for a quarterly row (US, " +
  "Taiwan) fy and fp are the CALENDAR year and quarter that contain the " +
  "period end, not the company's own fiscal quarter: Apple's quarter ending " +
  "2025-12-27 is 2025 Q4, which Apple calls Q1 of fiscal 2026, so name a " +
  "quarter by its period end, not by the label. A latest-view fact with a " +
  "quarterly fp is ONE quarter's figure, not a full year. " +
  "Licence: when you relay figures, keep the `attribution` notices and the " +
  "`licence` notice of the response with them.";

/** The disclosed known issues that change what a figure means, in the
 *  tool descriptions and in every data reply (`known_issues`), so an
 *  assistant reading such a figure hears of them without having called
 *  get_coverage. Details and estimates are on the methodology page; take an
 *  entry out when its correction has landed. None is open: the Korean dates
 *  (KR in 0.3.9) were corrected by the Korea reload of 23 October 2026 and
 *  the Danish equity figures (DK) by the equity check; #kr-known-issue and
 *  #dk-equity-known-issue are now notes of those fixes. The field stays, as
 *  {}, so a client that reads it keeps working. */
export const KNOWN_ISSUES = {};
export const KNOWN_ISSUES_TEXT = Object.keys(KNOWN_ISSUES).length
  ? `Known issues, being corrected (also in the known_issues field of each data reply): ${Object.values(KNOWN_ISSUES).join(" ")}`
  : "";

/** The detailed line-item codes and the figures calculated from them. Named
 *  in get_data_dictionary's description so a model knows which metric names
 *  the dictionary defines; their definitions are in its reply. */
export const LINE_ITEM_CODES =
  "trade_receivables, trade_and_other_receivables, inventories, trade_payables, trade_and_other_payables, ppe, " +
  "noncurrent_assets, current_assets, current_liabilities, retained_earnings, depreciation_amortization, " +
  "interest_expense, cash_flow_operating, capex, minority_interest, temporary_equity, land_and_buildings, land, " +
  "buildings, pension_provisions, cost_of_materials, purchases_of_goods, purchases_of_materials, " +
  "wages_and_salaries, operating_taxes, income_tax; calculated: free_cash_flow, working_capital, current_ratio, ebitda";

/** What a model must know before it calls a data tool, and nothing more.
 *  mcptry's security check flags a tool description over 4,000 characters
 *  (hard to review, easy to hide instructions in); the tests keep every
 *  description under 2,000.
 *
 *  Where the text that used to be in these descriptions lives now (0.4.2):
 *  - MARKET_SEMANTICS, whole (per-market filing dates, solo vs group,
 *    lawful gaps, NZ charities, the flags in `form`, attributes and
 *    activity_code, the EE/SE/SK/LV notes, period labels, the licence
 *    sentence): `market_notes` in every get_latest_fundamentals,
 *    get_fundamentals_history and get_coverage reply, unchanged; field by
 *    field also in the reply's `schema`, and per market on
 *    https://www.tradingagentapp.com/fundamentals/methodology.
 *  - The old LINE_ITEM_SEMANTICS, sentence by sentence, in the
 *    get_data_dictionary reply (GET /api/v1/fundamentals/dictionary, built
 *    from the line-item catalog):
 *      the list of codes                     metrics[].m, derived[].m (and LINE_ITEM_CODES)
 *      filed lines of the same filings,
 *        dated by their filing               about; rules[0] (Dating)
 *      markets read so far                   rules[7] (Scope of this version)
 *      local definitions, read the
 *        dictionary before comparing         rules[4]; metrics[].markets
 *      signs as filed, capex +US / -TW,JP    rules[1] (Signs)
 *      US/TW cash-flow lines annual only     rules[2]
 *      free_cash_flow, working_capital,
 *        current_ratio, ebitda calculated,
 *        form derived, one filing            rules[5]; derived[]
 *      Taiwan: no D&A, so no ebitda          rules[3]; derived ebitda
 *      no measured share = not loaded yet    measured_note
 *      missing is not zero, except EE
 *        noncurrent_assets and LV zeros      about
 *      small employers (BE, EE, SE, SK, LV)  rules[6] (Small employers)
 *    The data tools' descriptions keep one sentence of it (local rules,
 *    capex sign, call get_data_dictionary first).
 *  - The latest view's "each metric is its own latest value" and `stale`:
 *    kept in its description, and in the reply's schema.note and schema.stale. */
const DATA_CAVEATS =
  "Before using the figures: they are as filed, each keyed to its filing date (`filed`) as its market records " +
  "it (how each market dates a filing: https://www.tradingagentapp.com/fundamentals/methodology). " +
  ".TW quarterly values are already SINGLE-QUARTER amounts: do not difference adjacent quarters. For a " +
  "quarterly row (US, Taiwan) fy and fp are the CALENDAR quarter containing the period end, not the company's " +
  "fiscal quarter. Each reply's `market_notes` and `schema` give the per-market caveats (solo or group " +
  "accounts, lawful gaps, charities, flags in `form`); read them before interpreting a figure. Detailed line " +
  "items follow local accounting rules and keep the filed sign (capex is negative in Taiwan and Japan): call " +
  "get_data_dictionary before comparing them across markets. When you relay figures, keep the reply's " +
  "`attribution` and `licence` notices with them.";

/** Every tool only reads published filings: no tool changes anything, and
 *  the same call gives the same answer until a new filing arrives. Clients
 *  and directories (Claude's connector directory among them) read these
 *  hints to decide whether a call needs the user's confirmation. */
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };

/** MCP returns text; JSON is what a model reads most reliably. */
const toText = (value) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
const toError = (err) => ({
  isError: true,
  content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
});

/** A full history is easily tens of thousands of tokens — enough to crowd out
 *  the conversation it was fetched for. Return the most recent slice and say
 *  so, rather than silently truncating or silently flooding. */
export const MAX_ROWS = 250;

/** as_of and from are compared with dates as text on the server, which now
 *  refuses any other spelling (400). Checked here too, so a model gets the
 *  rule in the tool schema rather than from an error. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The fields of an API reply that must travel with its data: the source
 *  attributions, the licence notice (demo and evaluation data are
 *  supplied under a licence whose notice says that using them means
 *  accepting it), the company's register entry, how the filing dates work,
 *  and whether this is the whole record or only the latest fiscal
 *  year. 0.3.8 dropped all but the first, so an agent could not cite the
 *  register and never saw the licence. */
const envelope = (out) => ({
  ticker: out.ticker,
  as_of: out.as_of,
  point_in_time: out.point_in_time,
  full_history: out.full_history,
  history_depth: out.history_depth,
  company: out.company,
  attribution: out.attribution,
  licence: out.licence,
  market_notes: MARKET_SEMANTICS,
  known_issues: KNOWN_ISSUES,
});

/** At most `max` rows, chosen so that EVERY metric keeps its most recent
 *  rows. The API sorts by metric name and then fiscal year, so slicing its
 *  list kept the alphabetically first five metrics (asset_turnover … eps)
 *  back to 2014 and dropped revenue and net income altogether. Rows are
 *  taken newest first (period end, then filing date) from each metric in
 *  turn, then put back in the API's order. Returns the rows and, per metric,
 *  how many were returned of how many. */
export function recentRowsPerMetric(all, max = MAX_ROWS) {
  const byMetric = new Map();
  for (const r of all) {
    const list = byMetric.get(r.m) ?? [];
    list.push(r);
    byMetric.set(r.m, list);
  }
  const newestFirst = (a, b) =>
    String(b.end).localeCompare(String(a.end)) || String(b.filed).localeCompare(String(a.filed));
  const queues = [...byMetric.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([m, list]) => ({ m, list: list.slice().sort(newestFirst), taken: 0 }));
  const kept = [];
  let progressed = true;
  while (kept.length < max && progressed) {
    progressed = false;
    for (const q of queues) {
      if (kept.length >= max) break;
      if (q.taken < q.list.length) {
        kept.push(q.list[q.taken]);
        q.taken += 1;
        progressed = true;
      }
    }
  }
  const order = new Map(all.map((r, i) => [r, i]));
  kept.sort((a, b) => order.get(a) - order.get(b));
  const per_metric = {};
  for (const q of queues) per_metric[q.m] = { returned: q.taken, of: q.list.length };
  return { rows: kept, per_metric };
}


/**
 * Register the five tools on `server`.
 *
 *   z       zod v4 (`import * as z from "zod/v4"`), for the input schemas.
 *   api     (path, params) => the API's JSON body for GET /api/v1<path>;
 *           throws an Error carrying the API's message when it refuses.
 *   search  ({ query, market }) => the JSON of GET /api/search.
 *   around  optional (tool, args, run) => run(): wraps every call, for usage
 *           counting. Whatever it returns is the tool's result.
 *   notice  optional () => a string or null: when a string, it rides in every
 *           reply as `access` (and after an error), e.g. to say the caller is
 *           on the demo key and how to get an evaluation key.
 */
export function registerTools(server, { z, api, search, around, notice }) {
  const isoDay = (what) => z.string().regex(ISO_DAY, "a date written YYYY-MM-DD, e.g. 2022-01-01").optional().describe(what);
  const accessNote = () => (typeof notice === "function" ? notice() : null) || null;
  const asText = (value) => {
    const access = accessNote();
    return toText(access ? { access, ...value } : value);
  };
  const asError = (err) => {
    const out = toError(err);
    const access = accessNote();
    if (access) out.content.push({ type: "text", text: access });
    return out;
  };
  const wrap = (name, fn) => (args, ctx) =>
    typeof around === "function" ? around(name, args ?? {}, () => fn(args, ctx)) : fn(args, ctx);
  const registerTool = (name, config, fn) => server.registerTool(name, config, wrap(name, fn));

  registerTool(
    "get_latest_fundamentals",
    {
      title: "Latest fundamentals for a company",
      annotations: READ_ONLY,
      description:
        "The most recent reported value of each metric for one ticker, each with its period (fy, fp), " +
        "period end, filing date and form. Use it for a company's current figures, or with as_of for what had " +
        "been filed by a given day; call search_companies first if you have a name rather than a ticker. " +
        "Inputs: ticker (e.g. AAPL, 2330.TW, 005930.KS, 0403091220.BE, 775670417.FR, CC21860.NZC, and " +
        "10238429.EE, 5560356163.SE, 47239255.SK, 40003032949.LV where get_coverage lists them, and " +
        "96002925948.AU for Australia's tax figures); metric " +
        "(comma-separated; a name we do not hold is left out); as_of (only filings dated on or before that day). " +
        "On a free key, a company outside the full-history sample answers from its most recent reported fiscal " +
        "year only (history_depth says so) and as_of needs a licence or an evaluation key. Each metric is its " +
        "own latest value, so two metrics can come from different periods; a quarterly fp is ONE quarter's " +
        "figure, not a year; check `stale` (true: the company has filed since without this metric, so the " +
        "figure is not current). " +
        DATA_CAVEATS + (KNOWN_ISSUES_TEXT ? ` ${KNOWN_ISSUES_TEXT}` : ""),
      inputSchema: z.object({
        ticker: z.string().describe("Ticker symbol, e.g. AAPL or 2330.TW"),
        metric: z.string().optional().describe("Comma-separated metrics, e.g. revenue,net_income. Omit for all."),
        as_of: isoDay("Filing-date cut-off, YYYY-MM-DD (e.g. 2022-01-01). Defaults to today."),
      }),
    },
    async ({ ticker, metric, as_of }) => {
      try {
        const out = await api("/fundamentals", { ticker, metric, as_of, view: "latest" });
        return asText({
          ...envelope(out),
          schema: out.schema,
          ...(out.attributes ? { attributes: out.attributes } : {}),
          data: out.data,
        });
      } catch (e) {
        return asError(e);
      }
    },
  );

  registerTool(
    "get_fundamentals_history",
    {
      title: "Reported history for a company",
      annotations: READ_ONLY,
      description:
        "The stored figures for one ticker, one row per metric and period, each with its period (fy, fp), " +
        "period end, filing date and form. Use it for trends and for what was on file at a past date. Inputs: " +
        "ticker, metric (comma-separated), from (earliest period end), as_of (only filings dated on or before " +
        "that day). On a free key, a company outside the full-history sample answers with its most recent " +
        "reported fiscal year only: full_history false and history_depth say so, and older filings exist. " +
        `Long histories are capped at ${MAX_ROWS} rows, keeping the most recent rows of EVERY metric (per_metric ` +
        "says how many of each); narrow with metric/from for the rest. " +
        DATA_CAVEATS + (KNOWN_ISSUES_TEXT ? ` ${KNOWN_ISSUES_TEXT}` : ""),
      inputSchema: z.object({
        ticker: z.string().describe("Ticker symbol, e.g. AAPL or 2330.TW"),
        metric: z.string().optional().describe("Comma-separated metrics, e.g. revenue,net_income"),
        as_of: isoDay("Filing-date cut-off, YYYY-MM-DD: only filings dated on or before that day"),
        from: isoDay("Earliest period end to include, YYYY-MM-DD"),
      }),
    },
    async ({ ticker, metric, as_of, from }) => {
      try {
        const out = await api("/fundamentals", { ticker, metric, as_of, from });
        const all = out.data ?? [];
        const { rows, per_metric } = recentRowsPerMetric(all, MAX_ROWS);
        const truncated = all.length > rows.length;
        return asText({
          ...envelope(out),
          count: out.count,
          returned: rows.length,
          // `truncated` is this tool's row cap only. Whether the reply is
          // the company's whole record is full_history / history_depth.
          truncated,
          ...(truncated
            ? {
                truncation: `capped at ${MAX_ROWS} of ${all.length} rows: the most recent rows of every metric are kept ` +
                  "(per_metric). Ask again with metric and/or from for older rows.",
                per_metric,
              }
            : {}),
          ...(out.attributes ? { attributes: out.attributes } : {}),
          schema: out.schema,
          data: rows,
        });
      } catch (e) {
        return asError(e);
      }
    },
  );

  registerTool(
    "search_companies",
    {
      title: "Find a ticker by company name",
      annotations: READ_ONLY,
      description:
        "Look up the ticker for a company name or partial symbol — 'Apple', 'TSMC', '2330', 'samsung', " +
        "'LVMH'. Use this first when the user names a company rather than a ticker, and check the " +
        "market of the hit: a local subsidiary or a namesake in another country can share the name. " +
        "Pass market (US, JP, TW, KR, FR, BE, DK, NZC) to search one market only. Results with " +
        "market NZC are New Zealand registered charities, not listed companies.",
      inputSchema: z.object({
        query: z.string().describe("Company name or partial ticker"),
        market: z
          .string()
          .regex(/^[A-Za-z]{2,3}$/, "a market code such as US, FR or DK")
          .optional()
          .describe("Only this market: US, JP, TW, KR, FR, BE, DK or NZC"),
      }),
    },
    async ({ query, market }) => {
      try {
        return asText(await search({ query, market: market ? market.toUpperCase() : undefined }));
      } catch (e) {
        return asError(e);
      }
    },
  );

  registerTool(
    "get_coverage",
    {
      title: "What data is available",
      annotations: READ_ONLY,
      description:
        "Markets covered, ticker counts, history depth per market, the free-tier ticker list, " +
        "the metric vocabulary, the source attributions that must travel with the data, and the " +
        "licence the data is supplied under (with an evaluation key, its terms and end date).",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const out = await api("/fundamentals");
        return asText({
          tier: out.tier,
          licence: out.licence,
          evaluation: out.evaluation,
          oem_scope: out.oem_scope,
          markets: out.markets,
          coverage: out.coverage,
          free_tier: out.free_tier,
          metrics: out.metrics,
          line_items: out.line_items,
          notes: out.notes,
          point_in_time: out.point_in_time,
          market_notes: MARKET_SEMANTICS,
          known_issues: KNOWN_ISSUES,
          attribution: out.attribution,
        });
      } catch (e) {
        return asError(e);
      }
    },
  );

  registerTool(
    "get_data_dictionary",
    {
      title: "What each detailed line item means, per market",
      annotations: READ_ONLY,
      description:
        "The data dictionary of the detailed line items: for every metric, its definition, which filed line each " +
        "market reads it from (or why a market has none), and the measured share of that market's company-periods " +
        "that carry it; the figures we calculate from them, with their formulas; and the rules that apply to all " +
        "of them (dating, signs, annual-only cash-flow lines, small employers). Use it before comparing a line " +
        "item across markets, or to learn what a line-item code means. Codes: " + LINE_ITEM_CODES + ".",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const out = await api("/fundamentals/dictionary");
        return asText({ version: out.version, rules: out.rules, metrics: out.metrics, derived: out.derived, measured_note: out.measured_note, attribution: out.attribution });
      } catch (e) {
        return asError(e);
      }
    },
  );

  return server;
}
