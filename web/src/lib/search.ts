import { pinyin } from "pinyin-pro";

interface SearchKeys {
  lower: string;
  pinyin: string;
  initials: string;
}

const cache = new Map<string, SearchKeys>();

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "");

export const getSearchKeys = (text: string): SearchKeys => {
  const existing = cache.get(text);
  if (existing) return existing;

  const lower = text.toLowerCase();
  let pinyinJoined = "";
  let initials = "";

  try {
    const syllables = pinyin(text, { toneType: "none", type: "array" }) as string[];
    pinyinJoined = syllables.map((part) => normalize(part)).join("");
    initials = syllables.map((part) => part?.charAt(0) ?? "").join("");
  } catch {
    pinyinJoined = "";
    initials = "";
  }

  const keys = { lower, pinyin: pinyinJoined, initials: initials.toLowerCase() };
  cache.set(text, keys);
  return keys;
};

export const matchesSearch = (text: string, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  const keys = getSearchKeys(text);
  return (
    keys.lower.includes(normalizedQuery) ||
    keys.pinyin.includes(normalizedQuery.replace(/\s+/g, "")) ||
    keys.initials.includes(normalizedQuery)
  );
};
