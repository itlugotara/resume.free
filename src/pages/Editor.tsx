import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSettings, FiX } from "react-icons/fi";
import { SectionList } from "../components/SectionList";
import { SectionEditor } from "../components/SectionEditor";
import { LivePreview } from "../components/LivePreview";
import { StyleControls } from "../components/StyleControls";
import { ExportButton } from "../components/ExportButton";
import type { Section, GlobalStyles } from "../utils/types";
import { DEFAULT_GLOBAL_STYLES } from "../utils/types";

interface LocalResume {
  id: string;
  title: string;
  sections: Section[];
  globalStyles: GlobalStyles;
  createdAt: number;
  updatedAt: number;
}

function getResume(id: string): LocalResume | null {
  try {
    const resumes: LocalResume[] = JSON.parse(
      localStorage.getItem("resumefree_resumes") || "[]"
    );
    return resumes.find((r) => r.id === id) || null;
  } catch {
    return null;
  }
}

function saveResume(resume: LocalResume) {
  try {
    const resumes: LocalResume[] = JSON.parse(
      localStorage.getItem("resumefree_resumes") || "[]"
    );
    const idx = resumes.findIndex((r) => r.id === resume.id);
    if (idx >= 0) {
      resumes[idx] = resume;
    } else {
      resumes.unshift(resume);
    }
    localStorage.setItem("resumefree_resumes", JSON.stringify(resumes));
  } catch (e) {
    console.error("Save error:", e);
  }
}

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resume, setResume] = useState<LocalResume | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showStyles, setShowStyles] = useState(false);

  useEffect(() => {
    if (id) {
      const r = getResume(id);
      if (r) {
        setResume(r);
        if (r.sections.length > 0) {
          setActiveSection(r.sections[0].id);
        }
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const updateResume = useCallback(
    (updates: Partial<LocalResume>) => {
      setResume((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates, updatedAt: Date.now() };
        saveResume(updated);
        return updated;
      });
    },
    []
  );

  const handleUpdateSection = useCallback(
    (updatedSection: Section) => {
      if (!resume) return;
      const sections = resume.sections.map((s) =>
        s.id === updatedSection.id ? updatedSection : s
      );
      updateResume({ sections });
    },
    [resume, updateResume]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (!resume) return;
      const sections = resume.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i }));
      updateResume({ sections });
      if (activeSection === sectionId) {
        setActiveSection(sections[0]?.id || null);
      }
    },
    [resume, updateResume, activeSection]
  );

  const handleReorder = useCallback(
    (sections: Section[]) => {
      updateResume({ sections });
    },
    [updateResume]
  );

  const handleAddSection = useCallback(
    (section: Section) => {
      if (!resume) return;
      updateResume({ sections: [...resume.sections, section] });
      setActiveSection(section.id);
    },
    [resume, updateResume]
  );

  const handleStylesChange = useCallback(
    (globalStyles: GlobalStyles) => {
      updateResume({ globalStyles });
    },
    [updateResume]
  );

  if (!resume) {
    return (
      <div className="editor-loading">
        <div className="spinner" />
        <p>Loading resume...</p>
      </div>
    );
  }

  const currentSection = resume.sections.find((s) => s.id === activeSection);

  return (
    <div className="editor-layout">
      {/* Top Bar */}
      <header className="editor-topbar">
        <div className="topbar-left">
          <button className="btn-back" onClick={() => navigate("/")}>
            <FiArrowLeft size={20} />
          </button>
          <input
            className="resume-title-input"
            type="text"
            value={resume.title}
            onChange={(e) => updateResume({ title: e.target.value })}
            placeholder="Resume title"
          />
        </div>
        <div className="topbar-right">
          <button
            className={`btn-style-toggle ${showStyles ? "active" : ""}`}
            onClick={() => setShowStyles(!showStyles)}
            title="Style settings"
          >
            {showStyles ? <FiX size={20} /> : <FiSettings size={20} />}
          </button>
          <ExportButton
            sections={resume.sections}
            globalStyles={resume.globalStyles}
            title={resume.title}
          />
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="editor-body">
        {/* Left: Section List */}
        <aside className="editor-sidebar">
          <SectionList
            sections={resume.sections}
            activeId={activeSection}
            onSelect={setActiveSection}
            onReorder={handleReorder}
            onAdd={handleAddSection}
          />
        </aside>

        {/* Center: Section Editor */}
        <main className="editor-main">
          {currentSection ? (
            <SectionEditor
              key={currentSection.id}
              section={currentSection}
              onUpdate={handleUpdateSection}
              onDelete={handleDeleteSection}
            />
          ) : (
            <div className="editor-empty">
              <p>Select a section or add a new one</p>
            </div>
          )}
        </main>

        {/* Right: Preview + Style Controls */}
        <aside className={`editor-preview-panel ${showStyles ? "with-styles" : ""}`}>
          {showStyles && (
            <div className="styles-panel">
              <StyleControls
                styles={resume.globalStyles || DEFAULT_GLOBAL_STYLES}
                onChange={handleStylesChange}
              />
            </div>
          )}
          <LivePreview
            sections={resume.sections}
            globalStyles={resume.globalStyles || DEFAULT_GLOBAL_STYLES}
          />
        </aside>
      </div>
    </div>
  );
};
