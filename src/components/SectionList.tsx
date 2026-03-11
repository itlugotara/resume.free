import React from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiPlus } from "react-icons/fi";
import {
  MdPerson,
  MdDescription,
  MdWork,
  MdSchool,
  MdBuild,
  MdFolder,
  MdVerified,
  MdEmojiEvents,
  MdLanguage,
  MdStar,
  MdGroup,
} from "react-icons/md";
import type { Section } from "../utils/types";
import { SECTION_TYPES, createEmptySection } from "../utils/types";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  header: <MdPerson size={18} />,
  summary: <MdDescription size={18} />,
  experience: <MdWork size={18} />,
  education: <MdSchool size={18} />,
  skills: <MdBuild size={18} />,
  projects: <MdFolder size={18} />,
  certifications: <MdVerified size={18} />,
  awards: <MdEmojiEvents size={18} />,
  languages: <MdLanguage size={18} />,
  interests: <MdStar size={18} />,
  references: <MdGroup size={18} />,
  custom: <MdDescription size={18} />,
};

interface SortableItemProps {
  section: Section;
  isActive: boolean;
  onClick: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  section,
  isActive,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`section-list-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <FiMenu size={14} />
      </div>
      <div className="section-list-icon">
        {SECTION_ICONS[section.type] || SECTION_ICONS.custom}
      </div>
      <div className="section-list-info">
        <span className="section-list-title">{section.title || "Untitled"}</span>
        <span className="section-list-type">
          {SECTION_TYPES.find((t) => t.value === section.type)?.label || "Custom"}
        </span>
      </div>
    </motion.div>
  );
};

interface Props {
  sections: Section[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sections: Section[]) => void;
  onAdd: (section: Section) => void;
}

export const SectionList: React.FC<Props> = ({
  sections,
  activeId,
  onSelect,
  onReorder,
  onAdd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = [...sections];
      const [movedItem] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, movedItem);

      // Update order values
      const reordered = newSections.map((s, i) => ({ ...s, order: i }));
      onReorder(reordered);
    }
  };

  const handleAddSection = () => {
    const newSection = createEmptySection(
      "custom",
      "New Section",
      sections.length
    );
    onAdd(newSection);
  };

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="section-list">
      <div className="section-list-header">
        <h3>Sections</h3>
        <motion.button 
          className="btn-add-section" 
          onClick={handleAddSection} 
          title="Add section"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiPlus size={18} />
        </motion.button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sorted.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              isActive={activeId === section.id}
              onClick={() => onSelect(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
