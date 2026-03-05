import { ParsedImportRow, ParserError } from "@/types";

const entityMap: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

function decodeEntities(value: string): string {
  return Object.entries(entityMap).reduce((current, [entity, replacement]) => {
    return current.replaceAll(entity, replacement);
  }, value);
}

function normalizeField(value: string): string {
  return decodeEntities(stripHtml(value)).trim();
}

export function parseAnkiTsv(fileContent: string): {
  validRows: ParsedImportRow[];
  errors: ParserError[];
} {
  const normalized = fileContent.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");

  const validRows: ParsedImportRow[] = [];
  const errors: ParserError[] = [];

  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const trimmed = raw.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const parts = raw.split("\t");
    if (parts.length < 2) {
      errors.push({
        line: lineNumber,
        message: "Row is malformed. Expected front<TAB>back<TAB>tags?",
        raw,
      });
      return;
    }

    const front = normalizeField(parts[0]);
    const back = normalizeField(parts[1]);
    const tagColumn = parts[2] ?? "";
    const tags = tagColumn
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!front) {
      errors.push({
        line: lineNumber,
        message: "Row is missing front text",
        raw,
      });
      return;
    }

    if (!back) {
      errors.push({
        line: lineNumber,
        message: "Row is missing back text",
        raw,
      });
      return;
    }

    validRows.push({ front, back, tags });
  });

  return { validRows, errors };
}
