export interface SectionStyle {
  fontFamily?: string;
  fontSize?: number;
  titleFontSize?: number;
  color?: string;
  titleColor?: string;
  lineHeight?: number;
  marginBottom?: number;
  textAlign?: string;
  borderBottom?: boolean;
}

export interface SectionItem {
  id: string;
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  description?: string;
  bullets?: string[];
}

export interface Section {
  id: string;
  type: string;
  title: string;
  content?: string;
  items?: SectionItem[];
  order: number;
  style?: SectionStyle;
}

export interface GlobalStyles {
  fontFamily?: string;
  fontSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  lineHeight?: number;
  marginX?: number;
  marginY?: number;
  sectionSpacing?: number;
  template?: string;
}

export interface Resume {
  _id: string;
  userId: string;
  title: string;
  sections: Section[];
  globalStyles: GlobalStyles;
  createdAt: number;
  updatedAt: number;
}

export const SECTION_TYPES = [
  { value: "header", label: "Header / Contact" },
  { value: "summary", label: "Summary / Objective" },
  { value: "experience", label: "Work Experience" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "projects", label: "Projects" },
  { value: "certifications", label: "Certifications" },
  { value: "awards", label: "Awards" },
  { value: "languages", label: "Languages" },
  { value: "interests", label: "Interests" },
  { value: "references", label: "References" },
  { value: "custom", label: "Custom Section" },
] as const;

export const FONT_FAMILIES = [
  "Helvetica",
  "Times-Roman",
  "Courier",
];

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  fontFamily: "Helvetica",
  fontSize: 11,
  primaryColor: "#1a1a2e",
  secondaryColor: "#16213e",
  accentColor: "#0f3460",
  lineHeight: 1.4,
  marginX: 40,
  marginY: 40,
  sectionSpacing: 12,
  template: "classic",
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createEmptySection(type: string, title: string, order: number): Section {
  return {
    id: generateId(),
    type,
    title,
    content: "",
    items: [],
    order,
    style: {},
  };
}
