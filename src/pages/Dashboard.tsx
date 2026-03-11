import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiClock, FiFileText, FiTrash2 } from "react-icons/fi";
import { ResumeUploader } from "../components/ResumeUploader";
import type { Section, GlobalStyles } from "../utils/types";
import { DEFAULT_GLOBAL_STYLES, createEmptySection } from "../utils/types";

interface LocalResume {
  id: string;
  title: string;
  sections: Section[];
  globalStyles: GlobalStyles;
  createdAt: number;
  updatedAt: number;
}

function getResumes(): LocalResume[] {
  try {
    return JSON.parse(localStorage.getItem("resumefree_resumes") || "[]");
  } catch {
    return [];
  }
}

function saveResumes(resumes: LocalResume[]) {
  localStorage.setItem("resumefree_resumes", JSON.stringify(resumes));
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<LocalResume[]>(getResumes);
  const [showUploader, setShowUploader] = useState(false);

  const createBlank = useCallback(() => {
    const newResume: LocalResume = {
      id: crypto.randomUUID(),
      title: "Untitled Resume",
      sections: [
        createEmptySection("header", "Your Name", 0),
        createEmptySection("summary", "Professional Summary", 1),
        createEmptySection("experience", "Work Experience", 2),
        createEmptySection("education", "Education", 3),
        createEmptySection("skills", "Skills", 4),
      ],
      globalStyles: { ...DEFAULT_GLOBAL_STYLES },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newResume, ...resumes];
    saveResumes(updated);
    setResumes(updated);
    navigate(`/editor/${newResume.id}`);
  }, [resumes, navigate]);

  const handleSectionsDetected = useCallback(
    (sections: Section[], title: string) => {
      const newResume: LocalResume = {
        id: crypto.randomUUID(),
        title,
        sections,
        globalStyles: { ...DEFAULT_GLOBAL_STYLES },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newResume, ...resumes];
      saveResumes(updated);
      setResumes(updated);
      navigate(`/editor/${newResume.id}`);
    },
    [resumes, navigate]
  );

  const deleteResume = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Delete this resume?")) return;
      const updated = resumes.filter((r) => r.id !== id);
      saveResumes(updated);
      setResumes(updated);
    },
    [resumes]
  );

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <div className="logo-icon">
            <FiFileText size={28} />
          </div>
          <div>
            <h1>Resume.free</h1>
            <p className="tagline">Build beautiful resumes in seconds</p>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-actions">
          <button className="action-card create-card" onClick={createBlank}>
            <div className="action-icon">
              <FiPlus size={32} />
            </div>
            <h3>Create Blank</h3>
            <p>Start from scratch with a template</p>
          </button>

          <button
            className="action-card upload-card"
            onClick={() => setShowUploader(!showUploader)}
          >
            <div className="action-icon upload-icon-bg">
              <FiFileText size={32} />
            </div>
            <h3>Upload Resume</h3>
            <p>Import & detect sections from PDF</p>
          </button>
        </div>

        {showUploader && (
          <div className="uploader-section">
            <ResumeUploader onSectionsDetected={handleSectionsDetected} />
          </div>
        )}

        {resumes.length > 0 && (
          <section className="resumes-section">
            <h2 className="section-heading">
              <FiClock size={20} /> Your Resumes
            </h2>
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="resume-card"
                  onClick={() => navigate(`/editor/${resume.id}`)}
                >
                  <div className="resume-card-preview">
                    <FiFileText size={36} />
                  </div>
                  <div className="resume-card-info">
                    <h4>{resume.title}</h4>
                    <p>
                      {resume.sections.length} sections •{" "}
                      {formatDate(resume.updatedAt)}
                    </p>
                  </div>
                  <button
                    className="resume-card-delete"
                    onClick={(e) => deleteResume(resume.id, e)}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
