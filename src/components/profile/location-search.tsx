"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchLocations, type GeocodingResult } from "@/lib/geocoding";

export function LocationSearch({
  onSelect,
}: {
  onSelect: (result: GeocodingResult) => void;
}) {
  const t = useTranslations("Profile");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isQueryTooShort = query.trim().length < 2;

  function runSearch(value: string) {
    const trimmed = value.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const data = await searchLocations(trimmed, controller.signal);
        setResults(data);
      } catch {
        // Ignore aborted/failed lookups — the farmer can just keep typing.
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  // Cancel any in-flight search/debounce when the component unmounts.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setOpen(true);
            runSearch(value);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("locationSearchPlaceholder")}
          className="pl-8"
          aria-label={t("locationSearchLabel")}
        />
        {loading && !isQueryTooShort && (
          <Loader2
            className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      {open && !isQueryTooShort && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {loading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t("locationSearching")}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t("locationNoResults")}</p>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent/50"
                    onClick={() => {
                      onSelect(result);
                      setQuery(`${result.name}${result.admin1 ? `, ${result.admin1}` : ""}`);
                      setResults([]);
                      setOpen(false);
                    }}
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>
                      <span className="font-medium">{result.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {[result.admin2, result.admin1, result.country].filter(Boolean).join(", ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
