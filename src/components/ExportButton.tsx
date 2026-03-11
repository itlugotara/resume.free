import React, { useState } from "react";
import { FiDownload, FiLoader } from "react-icons/fi";
import { generatePdfBlob } from "../utils/pdfTemplates";
import type { Section, GlobalStyles } from "../utils/types";

interface Props {
  sections: Section[];
  globalStyles: GlobalStyles;
  title: string;
}

export const ExportButton: React.FC<Props> = ({
  sections,
  globalStyles,
  title,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (sections.length === 0) return;
    setIsExporting(true);
    try {
      const blob = await generatePdfBlob(sections, globalStyles);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="btn-export"
      onClick={handleExport}
      disabled={isExporting || sections.length === 0}
    >
      {isExporting ? (
        <>
          <FiLoader size={18} className="spin" /> Exporting...
        </>
      ) : (
        <>
          <FiDownload size={18} /> Export PDF
        </>
      )}
    </button>
  );
};
