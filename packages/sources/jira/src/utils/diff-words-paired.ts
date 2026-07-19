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
    if (oldWords[i] === newWords[j]) {
      i++;
      j++;
      continue;
    }

    const oldChunk = takeChunk(oldWords, i);
    const newChunk = takeChunk(newWords, j);

    const matchIndex = findBestMatch(oldWords, newWords, i, j);

    // 🔁 если нашли пересечение → считаем заменой
    if (matchIndex.found) {
      const removedPart = oldWords.slice(i, matchIndex.oldIndex);
      const addedPart = newWords.slice(j, matchIndex.newIndex);

      if (removedPart.length || addedPart.length) {
        changes.push({
          removed: format(removedPart),
          added: format(addedPart),
        });
      }

      i = matchIndex.oldIndex;
      j = matchIndex.newIndex;
      continue;
    }

    // иначе просто одиночные изменения
    if (oldWords[i]) {
      removed.push(format(oldChunk));
      i += 1;
    }

    if (newWords[j]) {
      added.push(format(newChunk));
      j += 1;
    }
  }

  return render({ changes, pureAdded: added, pureRemoved: removed });
}

/* ---------------- utils ---------------- */

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/);
}

function takeChunk(arr: string[], index: number): string[] {
  return arr.slice(index, index + 6);
}

function format(words: string[]): string {
  if (!words.length) return "";
  if (words.length <= 6) return words.join(" ");
  return `${words.slice(0, 2).join(" ")} ... ${words.slice(-2).join(" ")}`;
}

/**
 * пытаемся найти ближайшее совпадение (простая эвристика)
 */
function findBestMatch(
  oldWords: string[],
  newWords: string[],
  i: number,
  j: number,
) {
  const lookahead = 10;

  for (let oi = i; oi < i + lookahead && oi < oldWords.length; oi++) {
    for (let nj = j; nj < j + lookahead && nj < newWords.length; nj++) {
      if (oldWords[oi] === newWords[nj]) {
        return {
          found: true,
          oldIndex: oi,
          newIndex: nj,
        };
      }
    }
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
