type QSValue = string | undefined;

function normalizeQS(qs: string): string {
  const s = new URLSearchParams(qs || "");
  const entries = Array.from(s.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const sorted = new URLSearchParams(entries);
  return sorted.toString();
}

export function setQuery(
  prevQS: string,
  pairs: Record<string, QSValue>,
): string {
  const s = new URLSearchParams(prevQS || "");
  Object.entries(pairs).forEach(([k, v]) => {
    if (v === undefined || v === "") s.delete(k);
    else s.set(k, v);
  });
  return s.toString();
}

export function clearQuery(prevQS: string, keys: string[]): string {
  const s = new URLSearchParams(prevQS || "");
  keys.forEach((k) => {
    s.delete(k);
  });
  return s.toString();
}

export function isSameQuery(a: string, b: string): boolean {
  return normalizeQS(a) === normalizeQS(b);
}

export function withPageReset(
  pairs: Record<string, QSValue>,
): Record<string, QSValue> {
  return { ...pairs };
}

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}): string {
  const s = new URLSearchParams(params || "");
  if (value === null || value === "") s.delete(key);
  else s.set(key, value);
  const base = typeof window !== "undefined" ? window.location.pathname : "";
  const qs = s.toString();
  return qs ? `${base}?${qs}` : base;
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
}: {
  params: string;
  keysToRemove: string[];
}): string {
  const s = new URLSearchParams(params || "");
  keysToRemove.forEach((k) => {
    s.delete(k);
  });
  const base = typeof window !== "undefined" ? window.location.pathname : "";
  const qs = s.toString();
  return qs ? `${base}?${qs}` : base;
}

export const toYMD = (d?: Date) =>
  d ? new Date(d).toISOString().slice(0, 10) : undefined;

export function getCsvParam(sp: URLSearchParams | null, key: string): string[] {
  if (!sp) return [];
  const v = sp.get(key);
  return v
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

export function setCsvParam(
  prevQS: string,
  key: string,
  values: string[],
  resetPage = true,
): string {
  const pairs: Record<string, string | undefined> = {
    [key]: values.length ? values.join(",") : undefined,
  };
  return resetPage
    ? setQuery(prevQS, withPageReset(pairs))
    : setQuery(prevQS, pairs);
}

export function arraysShallowEqual(
  a: readonly string[],
  b: readonly string[],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}