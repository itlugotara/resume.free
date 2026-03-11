import React, { useEffect, useState, useRef } from "react";
import { generatePdfUrl } from "../utils/pdfTemplates";
import type { Section, GlobalStyles } from "../utils/types";

interface Props {
  sections: Section[];
  globalStyles: GlobalStyles;
}

export const LivePreview: React.FC<Props> = ({ sections, globalStyles }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (sections.length === 0) return;
      setIsGenerating(true);
      try {
        const url = await generatePdfUrl(sections, globalStyles);
        if (prevUrlRef.current) {
          URL.revokeObjectURL(prevUrlRef.current);
        }
        prevUrlRef.current = url;
        setPdfUrl(url);
      } catch (err) {
        console.error("PDF preview error:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sections, globalStyles]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return (
    <div className="live-preview">
      <div className="preview-header">
        <h3>Live Preview</h3>
        {isGenerating && <span className="preview-badge">Updating...</span>}
      </div>
      <div className="preview-container">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Resume Preview"
            className="preview-iframe"
          />
        ) : (
          <div className="preview-placeholder">
            <p>Your resume preview will appear here</p>
            <p className="preview-hint">Add sections or upload a resume to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
