import React from "react";
import type { GlobalStyles } from "../utils/types";
import { FONT_FAMILIES } from "../utils/types";

interface Props {
  styles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
}

export const StyleControls: React.FC<Props> = ({ styles, onChange }) => {
  const update = <K extends keyof GlobalStyles>(
    key: K,
    value: GlobalStyles[K]
  ) => {
    onChange({ ...styles, [key]: value });
  };

  return (
    <div className="style-controls">
      <h3 className="style-controls-title">Global Styles</h3>

      <div className="style-group">
        <label>Font Family</label>
        <select
          value={styles.fontFamily || "Helvetica"}
          onChange={(e) => update("fontFamily", e.target.value)}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="style-group">
        <label>Font Size</label>
        <input
          type="range"
          min={8}
          max={16}
          step={0.5}
          value={styles.fontSize || 11}
          onChange={(e) => update("fontSize", parseFloat(e.target.value))}
        />
        <span className="style-value">{styles.fontSize || 11}pt</span>
      </div>

      <div className="style-group">
        <label>Line Height</label>
        <input
          type="range"
          min={1}
          max={2}
          step={0.1}
          value={styles.lineHeight || 1.4}
          onChange={(e) => update("lineHeight", parseFloat(e.target.value))}
        />
        <span className="style-value">{styles.lineHeight || 1.4}</span>
      </div>

      <div className="style-group">
        <label>Primary Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={styles.primaryColor || "#1a1a2e"}
            onChange={(e) => update("primaryColor", e.target.value)}
          />
          <span>{styles.primaryColor || "#1a1a2e"}</span>
        </div>
      </div>

      <div className="style-group">
        <label>Accent Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={styles.accentColor || "#0f3460"}
            onChange={(e) => update("accentColor", e.target.value)}
          />
          <span>{styles.accentColor || "#0f3460"}</span>
        </div>
      </div>

      <div className="style-group">
        <label>Secondary Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={styles.secondaryColor || "#16213e"}
            onChange={(e) => update("secondaryColor", e.target.value)}
          />
          <span>{styles.secondaryColor || "#16213e"}</span>
        </div>
      </div>

      <div className="style-group">
        <label>Margin X</label>
        <input
          type="range"
          min={20}
          max={80}
          step={5}
          value={styles.marginX || 40}
          onChange={(e) => update("marginX", parseInt(e.target.value))}
        />
        <span className="style-value">{styles.marginX || 40}px</span>
      </div>

      <div className="style-group">
        <label>Margin Y</label>
        <input
          type="range"
          min={20}
          max={80}
          step={5}
          value={styles.marginY || 40}
          onChange={(e) => update("marginY", parseInt(e.target.value))}
        />
        <span className="style-value">{styles.marginY || 40}px</span>
      </div>

      <div className="style-group">
        <label>Section Spacing</label>
        <input
          type="range"
          min={4}
          max={30}
          step={2}
          value={styles.sectionSpacing || 12}
          onChange={(e) => update("sectionSpacing", parseInt(e.target.value))}
        />
        <span className="style-value">{styles.sectionSpacing || 12}px</span>
      </div>

      <div className="style-group">
        <label>Template</label>
        <select
          value={styles.template || "classic"}
          onChange={(e) => update("template", e.target.value)}
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    </div>
  );
};
