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
  const ids = [];

  for (const entry of entries) {
    if (!matchesQuickFilter(entry, message.quickFilter)) continue;

    if (matcher) {
      const found = new Set(matcher.find(buildSearchText(entry)));
      if (!keywords.every((keyword) => found.has(keyword))) continue;
    }

    ids.push(entry.id);
  }

  self.postMessage({
    type: "result",
    requestId: message.requestId,
    datasetKey: message.datasetKey,
    ids,
  });
};
