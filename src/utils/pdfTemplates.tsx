import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { Section, GlobalStyles } from "./types";
import { DEFAULT_GLOBAL_STYLES } from "./types";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf", fontWeight: "bold" },
  ],
});

const createStyles = (globalStyles: GlobalStyles) => {
  const gs = { ...DEFAULT_GLOBAL_STYLES, ...globalStyles };
  return StyleSheet.create({
    page: {
      fontFamily: gs.fontFamily || "Helvetica",
      fontSize: gs.fontSize || 11,
      paddingTop: gs.marginY || 40,
      paddingBottom: gs.marginY || 40,
      paddingLeft: gs.marginX || 40,
      paddingRight: gs.marginX || 40,
      color: gs.primaryColor || "#1a1a2e",
      lineHeight: gs.lineHeight || 1.4,
    },
    headerName: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
      color: gs.primaryColor || "#1a1a2e",
    },
    headerContact: {
      fontSize: 10,
      textAlign: "center",
      color: gs.secondaryColor || "#555",
      marginBottom: gs.sectionSpacing || 12,
    },
    sectionContainer: {
      marginBottom: gs.sectionSpacing || 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: gs.accentColor || "#0f3460",
      borderBottomWidth: 1,
      borderBottomColor: gs.accentColor || "#0f3460",
      paddingBottom: 2,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sectionContent: {
      fontSize: gs.fontSize || 11,
      lineHeight: gs.lineHeight || 1.4,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    itemTitle: {
      fontSize: (gs.fontSize || 11) + 1,
      fontWeight: "bold",
    },
    itemSubtitle: {
      fontSize: gs.fontSize || 11,
      fontStyle: "italic",
      color: gs.secondaryColor || "#555",
    },
    itemDate: {
      fontSize: gs.fontSize || 11,
      color: gs.secondaryColor || "#555",
    },
    bullet: {
      fontSize: gs.fontSize || 11,
      paddingLeft: 16,
      marginBottom: 1,
    },
    bulletDot: {
      position: "absolute",
      left: 4,
    },
  });
};

const ResumeSection: React.FC<{
  section: Section;
  styles: ReturnType<typeof createStyles>;
  globalStyles: GlobalStyles;
}> = ({ section, styles, globalStyles }) => {
  const sectionStyle = section.style || {};
  const gs = { ...DEFAULT_GLOBAL_STYLES, ...globalStyles };

  const customTitleStyle = {
    ...(sectionStyle.titleFontSize && { fontSize: sectionStyle.titleFontSize }),
    ...(sectionStyle.titleColor && { color: sectionStyle.titleColor }),
    ...(sectionStyle.fontFamily && { fontFamily: sectionStyle.fontFamily }),
    ...(sectionStyle.borderBottom === false && {
      borderBottomWidth: 0,
    }),
  };

  const customContentStyle = {
    ...(sectionStyle.fontSize && { fontSize: sectionStyle.fontSize }),
    ...(sectionStyle.color && { color: sectionStyle.color }),
    ...(sectionStyle.fontFamily && { fontFamily: sectionStyle.fontFamily }),
    ...(sectionStyle.lineHeight && { lineHeight: sectionStyle.lineHeight }),
    ...(sectionStyle.textAlign && { textAlign: sectionStyle.textAlign as any }),
  };

  if (section.type === "header") {
    return (
      <View>
        <Text style={styles.headerName}>{section.title}</Text>
        {section.content && (
          <Text style={styles.headerContact}>{section.content}</Text>
        )}
      </View>
    );
  }

  const hasItems = section.items && section.items.length > 0;

  return (
    <View
      style={{
        ...styles.sectionContainer,
        ...(sectionStyle.marginBottom !== undefined && {
          marginBottom: sectionStyle.marginBottom,
        }),
      }}
    >
      <Text style={{ ...styles.sectionTitle, ...customTitleStyle }}>
        {section.title}
      </Text>

      {hasItems ? (
        section.items!.map((item) => (
          <View key={item.id} style={{ marginBottom: 6 }}>
            <View style={styles.itemRow}>
              <Text style={{ ...styles.itemTitle, ...customContentStyle }}>
                {item.title}
              </Text>
              {item.date && (
                <Text style={styles.itemDate}>{item.date}</Text>
              )}
            </View>
            {item.subtitle && (
              <View style={styles.itemRow}>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                {item.location && (
                  <Text style={styles.itemDate}>{item.location}</Text>
                )}
              </View>
            )}
            {item.description && (
              <Text style={{ ...styles.sectionContent, ...customContentStyle }}>
                {item.description}
              </Text>
            )}
            {item.bullets?.map((bullet, idx) => (
              <View key={idx} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={customContentStyle}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))
      ) : (
        section.content && (
          <Text style={{ ...styles.sectionContent, ...customContentStyle }}>
            {section.content}
          </Text>
        )
      )}
    </View>
  );
};

export const ResumeDocument: React.FC<{
  sections: Section[];
  globalStyles: GlobalStyles;
}> = ({ sections, globalStyles }) => {
  const styles = createStyles(globalStyles);
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {sortedSections.map((section) => (
          <ResumeSection
            key={section.id}
            section={section}
            styles={styles}
            globalStyles={globalStyles}
          />
        ))}
      </Page>
    </Document>
  );
};

export async function generatePdfBlob(
  sections: Section[],
  globalStyles: GlobalStyles
): Promise<Blob> {
  const doc = <ResumeDocument sections={sections} globalStyles={globalStyles} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export async function generatePdfUrl(
  sections: Section[],
  globalStyles: GlobalStyles
): Promise<string> {
  const blob = await generatePdfBlob(sections, globalStyles);
  return URL.createObjectURL(blob);
}
