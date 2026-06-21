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

