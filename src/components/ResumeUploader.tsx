import React, { useCallback, useState, useRef } from "react";
import { FiUploadCloud, FiFile } from "react-icons/fi";
import { extractSectionsFromPdf } from "../utils/pdfParser";
import type { Section } from "../utils/types";

interface Props {
  onSectionsDetected: (sections: Section[], title: string) => void;
}

export const ResumeUploader: React.FC<Props> = ({ onSectionsDetected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      setIsProcessing(true);
      setFileName(file.name);
      try {
        const result = await extractSectionsFromPdf(file);
        onSectionsDetected(result.sections, result.rawName);
      } catch (err) {
        console.error("PDF parse error:", err);
        alert("Failed to parse PDF. Please try a different file.");
      } finally {
        setIsProcessing(false);
      }
    },
    [onSectionsDetected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`upload-zone ${isDragging ? "dragging" : ""} ${isProcessing ? "processing" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {isProcessing ? (
        <div className="upload-content">
          <div className="spinner" />
          <p className="upload-label">Analyzing resume...</p>
          <p className="upload-sublabel">Detecting sections from {fileName}</p>
        </div>
      ) : (
        <div className="upload-content">
          <div className="upload-icon-wrapper">
            {fileName ? <FiFile size={40} /> : <FiUploadCloud size={40} />}
          </div>
          <p className="upload-label">
            {fileName ? fileName : "Drop your resume PDF here"}
          </p>
          <p className="upload-sublabel">
            {fileName
              ? "Drop another file to replace"
              : "or click to browse • PDF files supported"}
          </p>
        </div>
      )}
    </div>
  );
};
