type ChangeBlock = {
  removed: string;
  added: string;
};

type DiffOutput = {
  changes: ChangeBlock[];
  pureAdded: string[];
  pureRemoved: string[];
};

export function diffWordsPaired(oldText: string, newText: string): string {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);

  const changes: ChangeBlock[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  let i = 0;
  let j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (
      i < oldWords.length &&
      j < newWords.length &&
      oldWords[i] === newWords[j]
    ) {
      i++;
      j++;
      continue;
    }

    const match = findBestMatch(oldWords, newWords, i, j);

    if (match.found) {
      const removedPart = oldWords.slice(i, match.oldIndex);
      const addedPart = newWords.slice(j, match.newIndex);

      if (removedPart.length || addedPart.length) {
        changes.push({
          removed: format(removedPart),
          added: format(addedPart),
        });
      }

      i = match.oldIndex;
      j = match.newIndex;
      continue;
    }

    if (i < oldWords.length) {
      removed.push(format(oldWords.slice(i)));
    }
    if (j < newWords.length) {
      added.push(format(newWords.slice(j)));
    }
    break;
  }

  return render({ changes, pureAdded: added, pureRemoved: removed });
}

/* ---------------- utils ---------------- */

function tokenize(text: string): string[] {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/) : [];
}

function format(words: string[]): string {
  if (!words.length) return "";
  if (words.length <= 6) return words.join(" ");
  return `${words.slice(0, 2).join(" ")} ... ${words.slice(-2).join(" ")}`;
}

function findBestMatch(
  oldWords: string[],
  newWords: string[],
  i: number,
  j: number,
): { found: boolean; oldIndex: number; newIndex: number } {
  const lookahead = 10;

  let best: { oldIndex: number; newIndex: number; dist: number } | null = null;

  const oiMax = Math.min(i + lookahead, oldWords.length);
  const njMax = Math.min(j + lookahead, newWords.length);

  for (let oi = i; oi < oiMax; oi++) {
    for (let nj = j; nj < njMax; nj++) {
      if (oldWords[oi] === newWords[nj]) {
        const dist = oi - i + (nj - j);

        if (dist === 0) continue;

        if (!best || dist < best.dist) {
          best = { oldIndex: oi, newIndex: nj, dist };
        }
      }
    }
  }

  if (best) {
    return { found: true, oldIndex: best.oldIndex, newIndex: best.newIndex };
  }
  return { found: false, oldIndex: i, newIndex: j };
}

function render(diff: DiffOutput): string {
  const parts: string[] = [];

  for (const c of diff.changes) {
    parts.push(`change:\n  - removed: ${c.removed}\n  - added:   ${c.added}`);
  }

  if (diff.pureAdded.length) {
    parts.push(`added: ${diff.pureAdded.join(" | ")}`);
  }

  if (diff.pureRemoved.length) {
    parts.push(`removed: ${diff.pureRemoved.join(" | ")}`);
  }

  return parts.join("\n\n");
}
