import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
        <motion.div 
          className="dashboard-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="action-card create-card" 
            onClick={createBlank}
          >
            <div className="action-icon">
              <FiPlus size={32} />
            </div>
            <h3>Create Blank</h3>
            <p>Start from scratch with a template</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="action-card upload-card"
            onClick={() => setShowUploader(!showUploader)}
          >
            <div className="action-icon upload-icon-bg">
              <FiFileText size={32} />
            </div>
            <h3>Upload Resume</h3>
            <p>Import & detect sections from PDF</p>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showUploader && (
            <motion.div 
              className="uploader-section"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResumeUploader onSectionsDetected={handleSectionsDetected} />
            </motion.div>
          )}
        </AnimatePresence>

        {resumes.length > 0 && (
          <motion.section 
            className="resumes-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="section-heading">
              <FiClock size={20} /> Your Resumes
            </h2>
            <motion.div 
              className="resumes-grid"
              variants={{
                show: { transition: { staggerChildren: 0.05 } }
              }}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {resumes.map((resume) => (
                  <motion.div
                    key={resume.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.section>
        )}
      </main>
    </div>
  );
};
