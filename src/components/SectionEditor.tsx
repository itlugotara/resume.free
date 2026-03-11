import React from "react";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import type { Section, SectionItem } from "../utils/types";
import { SECTION_TYPES, generateId } from "../utils/types";

interface Props {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: (id: string) => void;
}

export const SectionEditor: React.FC<Props> = ({
  section,
  onUpdate,
  onDelete,
}) => {
  const updateField = <K extends keyof Section>(key: K, value: Section[K]) => {
    onUpdate({ ...section, [key]: value });
  };

  const updateItem = (itemId: string, updates: Partial<SectionItem>) => {
    const items = (section.items || []).map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateField("items", items);
  };

  const addItem = () => {
    const newItem: SectionItem = {
      id: generateId(),
      title: "",
      subtitle: "",
      date: "",
      location: "",
      description: "",
      bullets: [],
    };
    updateField("items", [...(section.items || []), newItem]);
  };

  const removeItem = (itemId: string) => {
    updateField(
      "items",
      (section.items || []).filter((i) => i.id !== itemId)
    );
  };

  const addBullet = (itemId: string) => {
    const items = (section.items || []).map((item) =>
      item.id === itemId
        ? { ...item, bullets: [...(item.bullets || []), ""] }
        : item
    );
    updateField("items", items);
  };

  const updateBullet = (itemId: string, bulletIdx: number, value: string) => {
    const items = (section.items || []).map((item) =>
      item.id === itemId
        ? {
            ...item,
            bullets: (item.bullets || []).map((b, i) =>
              i === bulletIdx ? value : b
            ),
          }
        : item
    );
    updateField("items", items);
  };

  const removeBullet = (itemId: string, bulletIdx: number) => {
    const items = (section.items || []).map((item) =>
      item.id === itemId
        ? {
            ...item,
            bullets: (item.bullets || []).filter((_, i) => i !== bulletIdx),
          }
        : item
    );
    updateField("items", items);
  };

  const isStructuredType =
    section.type === "experience" || section.type === "education" || section.type === "projects";

  return (
    <div className="section-editor">
      <div className="section-editor-header">
        <select
          className="section-type-select"
          value={section.type}
          onChange={(e) => updateField("type", e.target.value)}
        >
          {SECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          className="btn-icon btn-danger"
          onClick={() => onDelete(section.id)}
          title="Delete section"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      <input
        className="section-title-input"
        type="text"
        value={section.title}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="Section title"
      />

      {section.type === "header" && (
        <textarea
          className="section-content-textarea"
          value={section.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder="Contact info (email, phone, location, links...)"
          rows={2}
        />
      )}

      {!isStructuredType && section.type !== "header" && (
        <textarea
          className="section-content-textarea"
          value={section.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder="Section content..."
          rows={4}
        />
      )}

      {isStructuredType && (
        <div className="items-editor">
          {(section.items || []).map((item, idx) => (
            <div key={item.id} className="item-card">
              <div className="item-card-header">
                <span className="item-number">#{idx + 1}</span>
                <button
                  className="btn-icon btn-danger-sm"
                  onClick={() => removeItem(item.id)}
                >
                  <FiMinus size={14} />
                </button>
              </div>
              <div className="item-fields">
                <input
                  type="text"
                  placeholder={section.type === "education" ? "Degree / School" : "Title / Role"}
                  value={item.title || ""}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder={section.type === "education" ? "Institution" : "Company / Organization"}
                  value={item.subtitle || ""}
                  onChange={(e) =>
                    updateItem(item.id, { subtitle: e.target.value })
                  }
                />
                <div className="item-row">
                  <input
                    type="text"
                    placeholder="Date range"
                    value={item.date || ""}
                    onChange={(e) =>
                      updateItem(item.id, { date: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={item.location || ""}
                    onChange={(e) =>
                      updateItem(item.id, { location: e.target.value })
                    }
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={item.description || ""}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                  rows={2}
                />
                <div className="bullets-editor">
                  <label className="bullets-label">Bullet Points</label>
                  {(item.bullets || []).map((bullet, bIdx) => (
                    <div key={bIdx} className="bullet-row">
                      <span className="bullet-dot">•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) =>
                          updateBullet(item.id, bIdx, e.target.value)
                        }
                        placeholder="Achievement or responsibility..."
                      />
                      <button
                        className="btn-icon btn-danger-sm"
                        onClick={() => removeBullet(item.id, bIdx)}
                      >
                        <FiMinus size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn-add-bullet"
                    onClick={() => addBullet(item.id)}
                  >
                    <FiPlus size={14} /> Add Bullet
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="btn-add-item" onClick={addItem}>
            <FiPlus size={16} /> Add{" "}
            {section.type === "education" ? "Education" : section.type === "projects" ? "Project" : "Experience"}
          </button>
        </div>
      )}
    </div>
  );
};
