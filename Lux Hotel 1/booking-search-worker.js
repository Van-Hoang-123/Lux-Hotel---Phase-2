function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "d")
    .toLowerCase();
}

function searchKeywords(query, minimumLength = 1) {
  const normalized = normalizeSearchText(query).trim();
  if (!normalized) return [];

  return [...new Set(normalized.split(/[,\s]+/).filter((keyword) => keyword.length >= minimumLength))];
}

function createAhoCorasickMatcher(patterns) {
  const cleanedPatterns = [...new Set(
    patterns
      .map((pattern) => String(pattern || "").trim())
      .filter(Boolean)
  )];
  const nodes = [{ next: new Map(), go: new Map(), failure: 0, exit: -1, outputs: [] }];
  const alphabet = new Set();

  cleanedPatterns.forEach((pattern) => {
    let state = 0;
    for (const character of pattern) {
      alphabet.add(character);
      if (!nodes[state].next.has(character)) {
        nodes[state].next.set(character, nodes.length);
        nodes.push({ next: new Map(), go: new Map(), failure: 0, exit: -1, outputs: [] });
      }
      state = nodes[state].next.get(character);
    }
    nodes[state].outputs.push(pattern);
  });

  const alphabetList = [...alphabet];
  alphabetList.forEach((character) => {
    nodes[0].go.set(character, nodes[0].next.get(character) ?? 0);
  });

  const queue = [...nodes[0].next.values()];
  while (queue.length) {
    const state = queue.shift();
    const failure = nodes[state].failure;
    nodes[state].exit = nodes[failure].outputs.length ? failure : nodes[failure].exit;

    for (const character of alphabetList) {
      if (nodes[state].next.has(character)) {
        const target = nodes[state].next.get(character);
        nodes[state].go.set(character, target);
        nodes[target].failure = nodes[failure].go.get(character) ?? 0;
        queue.push(target);
      } else {
        nodes[state].go.set(character, nodes[failure].go.get(character) ?? 0);
      }
    }
  }

  const go = (state, character) => nodes[state].go.get(character) ?? 0;

  const find = (text) => {
    if (nodes.length === 1 || !text) return [];

    const matches = [];
    let state = 0;
    for (const character of String(text)) {
      state = go(state, character);

      for (const pattern of nodes[state].outputs) matches.push(pattern);
      for (let exit = nodes[state].exit; exit !== -1; exit = nodes[exit].exit) {
        for (const pattern of nodes[exit].outputs) matches.push(pattern);
      }
    }

    return matches;
  };

  return { find };
}

function matchesQuickFilter(entry, quickFilter) {
  if (quickFilter === "needs-payment") return Boolean(entry.canCompletePayment);
  if (quickFilter === "paid") return Boolean(entry.isPaid);
  if (quickFilter === "cancelled") return Boolean(entry.isCancelled);
  return true;
}

function buildSearchText(entry) {
  if (entry.searchText) return entry.searchText;

  entry.searchText = normalizeSearchText((entry.searchParts || []).filter(Boolean).join(" "));
  delete entry.searchParts;
  return entry.searchText;
}

function normalizeField(value) {
  return normalizeSearchText(value).trim();
}

function fieldScore(value, keyword, weights) {
  const text = normalizeField(value);
  if (!text || !keyword) return 0;

  if (text === keyword) return weights.exact;

  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.includes(keyword)) return weights.token;
  if (tokens.some((token) => token.startsWith(keyword))) return weights.prefix;
  if (text.startsWith(keyword)) return weights.prefix;
  if (text.includes(keyword)) return weights.contains;

  return 0;
}

function scoreEntry(entry, keywords) {
  if (!keywords.length) return 0;

  const fields = entry.searchFields || {};
  return keywords.reduce((score, keyword) => {
    const guestScore = Math.max(
      fieldScore(fields.guestName, keyword, { exact: 9000, token: 7600, prefix: 7000, contains: 5600 }),
      fieldScore(fields.guestEmail, keyword, { exact: 7200, token: 6400, prefix: 5800, contains: 4200 })
    );
    const bookingScore = Math.max(
      fieldScore(fields.roomName, keyword, { exact: 2200, token: 1900, prefix: 1700, contains: 1300 }),
      fieldScore(fields.status, keyword, { exact: 900, token: 780, prefix: 700, contains: 500 }),
      fieldScore(fields.payment, keyword, { exact: 740, token: 660, prefix: 600, contains: 420 }),
      fieldScore(fields.dates, keyword, { exact: 520, token: 460, prefix: 420, contains: 300 }),
      fieldScore(fields.meta, keyword, { exact: 260, token: 220, prefix: 180, contains: 120 })
    );

    return score + Math.max(guestScore, bookingScore);
  }, 0);
}

let entries = [];

self.onmessage = (event) => {
  const message = event.data || {};

  if (message.type === "load") {
    entries = Array.isArray(message.entries) ? message.entries : [];
    self.postMessage({ type: "ready", datasetKey: message.datasetKey });
    return;
  }

  if (message.type !== "search") return;

  const keywords = searchKeywords(message.query, 1);
  const matcher = keywords.length ? createAhoCorasickMatcher(keywords) : null;
  const matches = [];

  for (const entry of entries) {
    if (!matchesQuickFilter(entry, message.quickFilter)) continue;

    if (matcher) {
      const found = new Set(matcher.find(buildSearchText(entry)));
      if (!keywords.every((keyword) => found.has(keyword))) continue;
    }

    matches.push({
      id: entry.id,
      score: scoreEntry(entry, keywords),
      sortIndex: Number(entry.sortIndex || 0),
    });
  }

  matches.sort((left, right) => (right.score - left.score) || (left.sortIndex - right.sortIndex));

  self.postMessage({
    type: "result",
    requestId: message.requestId,
    datasetKey: message.datasetKey,
    ids: matches.map((match) => match.id),
  });
};
