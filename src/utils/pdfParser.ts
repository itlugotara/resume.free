import * as pdfjsLib from "pdfjs-dist";
import type { Section, SectionItem } from "./types";
import { generateId } from "./types";

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface TextItem {
  str: string;
  fontSize: number;
  fontName: string;
  y: number;
  x: number;
  bold: boolean;
}

const SECTION_KEYWORDS: Record<string, string[]> = {
  summary: ["summary", "objective", "profile", "about", "professional summary", "career objective", "about me"],
  experience: ["experience", "work experience", "employment", "work history", "professional experience", "career history"],
  education: ["education", "academic", "qualifications", "academic background"],
  skills: ["skills", "technical skills", "competencies", "expertise", "core competencies", "proficiencies"],
  projects: ["projects", "personal projects", "key projects", "portfolio"],
  certifications: ["certifications", "certificates", "licenses", "credentials"],
  awards: ["awards", "honors", "achievements", "recognitions"],
  languages: ["languages", "language proficiency"],
  interests: ["interests", "hobbies", "activities"],
  references: ["references"],
};

function detectSectionType(title: string): string {
  const lower = title.toLowerCase().trim();
  for (const [type, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return type;
    }
  }
  return "custom";
}

function isHeading(item: TextItem, avgFontSize: number): boolean {
  const isLarger = item.fontSize > avgFontSize * 1.15;
  const isBold = item.bold || item.fontName.toLowerCase().includes("bold");
  const isAllCaps = item.str === item.str.toUpperCase() && item.str.length > 2 && /[A-Z]/.test(item.str);
  return isLarger || isBold || isAllCaps;
}

export async function extractSectionsFromPdf(file: File): Promise<{
  sections: Section[];
  rawName: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allItems: TextItem[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    for (const item of content.items) {
      if ("str" in item && item.str.trim()) {
        const transform = item.transform;
        allItems.push({
          str: item.str,
          fontSize: Math.abs(transform[0]) || Math.abs(transform[3]) || 12,
          fontName: item.fontName || "",
          y: viewport.height - transform[5],
          x: transform[4],
          bold: item.fontName?.toLowerCase().includes("bold") || false,
        });
      }
    }
  }

  if (allItems.length === 0) {
    return {
      sections: [
        {
          id: generateId(),
          type: "summary",
          title: "Summary",
          content: "Unable to extract text from this PDF. Please add your content manually.",
          items: [],
          order: 0,
          style: {},
        },
      ],
      rawName: file.name.replace(".pdf", ""),
    };
  }

  // Calculate average font size
  const totalFontSize = allItems.reduce((sum, item) => sum + item.fontSize, 0);
  const avgFontSize = totalFontSize / allItems.length;

  // Group items into lines by Y position
  const lines: { y: number; items: TextItem[] }[] = [];
  const sortedItems = [...allItems].sort((a, b) => a.y - b.y);

  for (const item of sortedItems) {
    const existingLine = lines.find((l) => Math.abs(l.y - item.y) < 3);
    if (existingLine) {
      existingLine.items.push(item);
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  }

  // Sort items within each line by X position
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
  }

  // Detect header (name) — usually the first line with largest font
  const firstFewLines = lines.slice(0, 5);
  let headerLineIdx = 0;
  let maxFontSize = 0;
  for (let i = 0; i < firstFewLines.length; i++) {
    const lineFontSize = Math.max(...firstFewLines[i].items.map((item) => item.fontSize));
    if (lineFontSize > maxFontSize) {
      maxFontSize = lineFontSize;
      headerLineIdx = i;
    }
  }

  // Build sections
  const sections: Section[] = [];
  let currentSection: { title: string; type: string; lines: string[] } | null = null;

  // First, detect the name from the header
  const headerLine = lines[headerLineIdx];
  const personName = headerLine.items.map((i) => i.str).join(" ");

  // Collect contact info (lines near the header that aren't headings)
  const contactLines: string[] = [];
  for (let i = 0; i < Math.min(lines.length, headerLineIdx + 4); i++) {
    if (i === headerLineIdx) continue;
    const lineText = lines[i].items.map((item) => item.str).join(" ").trim();
    if (lineText) contactLines.push(lineText);
  }

  // Add header section
  sections.push({
    id: generateId(),
    type: "header",
    title: personName,
    content: contactLines.join(" | "),
    items: [],
    order: 0,
    style: {},
  });

  // Process remaining lines for section detection
  const startIdx = headerLineIdx + contactLines.length + 1;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const lineText = line.items.map((item) => item.str).join(" ").trim();
    if (!lineText) continue;

    const lineIsHeading = line.items.some((item) => isHeading(item, avgFontSize));

    if (lineIsHeading && lineText.length < 60) {
      // Save previous section
      if (currentSection) {
        const type = detectSectionType(currentSection.title);
        sections.push({
          id: generateId(),
          type,
          title: currentSection.title,
          content: currentSection.lines.join("\n"),
          items: type === "experience" || type === "education"
            ? parseStructuredItems(currentSection.lines)
            : [],
          order: sections.length,
          style: {},
        });
      }
      currentSection = { title: lineText, type: "custom", lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(lineText);
    } else {
      // Content before any heading — add to summary
      if (!currentSection) {
        currentSection = { title: "Summary", type: "summary", lines: [lineText] };
      }
    }
  }

  // Save last section
  if (currentSection) {
    const type = detectSectionType(currentSection.title);
    sections.push({
      id: generateId(),
      type,
      title: currentSection.title,
      content: currentSection.lines.join("\n"),
      items: type === "experience" || type === "education"
        ? parseStructuredItems(currentSection.lines)
        : [],
      order: sections.length,
      style: {},
    });
  }

  return {
    sections: sections.length > 0 ? sections : [{
      id: generateId(),
      type: "summary",
      title: "Summary",
      content: allItems.map((i) => i.str).join(" "),
      items: [],
      order: 0,
      style: {},
    }],
    rawName: personName || file.name.replace(".pdf", ""),
  };
}

function parseStructuredItems(lines: string[]): SectionItem[] {
  const items: SectionItem[] = [];
  let currentItem: SectionItem | null = null;

  for (const line of lines) {
    // Heuristic: lines with dates or titles that look like job/school entries
    const datePattern = /\b(19|20)\d{2}\b|present|current/i;
    const bulletPattern = /^[\s]*[•\-–—◦▪]|^\s*\d+\./;

    if (datePattern.test(line) && !bulletPattern.test(line)) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        id: generateId(),
        title: line.replace(datePattern, "").trim(),
        date: (line.match(datePattern) || [""])[0],
        description: "",
        bullets: [],
      };
    } else if (bulletPattern.test(line)) {
      const bullet = line.replace(bulletPattern, "").trim();
      if (currentItem && bullet) {
        currentItem.bullets = [...(currentItem.bullets || []), bullet];
      }
    } else if (currentItem) {
      if (!currentItem.subtitle) {
        currentItem.subtitle = line;
      } else {
        currentItem.description = (currentItem.description || "") + " " + line;
      }
    }
  }

  if (currentItem) items.push(currentItem);
  return items;
}
