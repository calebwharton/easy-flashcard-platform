"use client";

import { ChangeEvent, useMemo, useState, useTransition } from "react";
import { importAnkiFile } from "@/app/actions/import";

type ImportStatus = "idle" | "submitting" | "success" | "partial" | "error";

type ImportResult = {
  successCount: number;
  failedCount: number;
  errors: { line: number; message: string }[];
};

type ImportFlowProps = {
  deckId: string;
};

const sample = `decir\tto say / to tell\tverb,core
preguntar\tto ask\tverb`;

export function ImportFlow({ deckId }: ImportFlowProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("Paste TSV data or upload a .tsv/.txt file.");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusLabel = useMemo(() => {
    if (status === "submitting") return "Importing...";
    if (status === "success") return "Import complete";
    if (status === "partial") return "Import completed with issues";
    if (status === "error") return "Import failed";
    return "Ready to import";
  }, [status]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".txt") && !lower.endsWith(".tsv")) {
      setStatus("error");
      setMessage("Unsupported file type. Please use .txt or .tsv.");
      return;
    }

    file
      .text()
      .then((text) => {
        setContent(text);
        setStatus("idle");
        setMessage(`Loaded ${file.name}.`);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not read the selected file.");
      });
  };

  const onSubmit = () => {
    const payload = content.trim();
    if (!payload) {
      setStatus("error");
      setMessage("Cannot import an empty payload.");
      return;
    }

    startTransition(async () => {
      setStatus("submitting");
      const response = await importAnkiFile(deckId, payload);
      setResult(response);

      if (response.failedCount === 0) {
        setStatus("success");
        setMessage(`Imported ${response.successCount} cards.`);
      } else if (response.successCount > 0) {
        setStatus("partial");
        setMessage(`Imported ${response.successCount} cards with ${response.failedCount} row issues.`);
      } else {
        setStatus("error");
        setMessage("No cards were imported.");
      }
    });
  };

  const onClear = () => {
    setContent("");
    setResult(null);
    setStatus("idle");
    setMessage("Input cleared.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Step 1 · Format</h2>
        <p className="mt-2 text-muted-foreground">Use one row per card with tab-separated values: front, back, optional comma-separated tags.</p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">{sample}</pre>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Step 2 · Input</h2>
        <label className="block text-sm text-muted-foreground" htmlFor="import-text">
          TSV content
        </label>
        <textarea
          className="min-h-52 w-full rounded-xl border border-border bg-background px-3 py-2"
          id="import-text"
          onChange={(event) => setContent(event.target.value)}
          placeholder="decir\tto say"
          value={content}
        />
        <label className="block text-sm text-muted-foreground" htmlFor="import-file">
          Upload .txt or .tsv
        </label>
        <input className="w-full rounded-xl border border-border bg-background px-3 py-2" id="import-file" onChange={handleFile} type="file" />
        <div className="flex gap-2">
          <button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:brightness-95 disabled:opacity-50" disabled={isPending} onClick={onSubmit} type="button">
            Import Cards
          </button>
          <button className="rounded-xl border border-border px-4 py-2 text-muted-foreground hover:bg-background" onClick={onClear} type="button">
            Clear
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Step 3 · Results</h2>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {statusLabel}: {message}
        </p>
        {result ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-background p-3 text-sm">
              <p>Imported {result.successCount} cards</p>
              <p>Failed {result.failedCount} rows</p>
            </div>
            {result.errors.length > 0 ? (
              <ul className="space-y-2">
                {result.errors.map((error) => (
                  <li key={`${error.line}-${error.message}`} className="rounded-xl bg-warning/20 px-3 py-2 text-sm text-warning-foreground">
                    Row {error.line}: {error.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
