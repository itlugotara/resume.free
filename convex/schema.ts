import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const sectionStyle = v.object({
  fontFamily: v.optional(v.string()),
  fontSize: v.optional(v.number()),
  titleFontSize: v.optional(v.number()),
  color: v.optional(v.string()),
  titleColor: v.optional(v.string()),
  lineHeight: v.optional(v.number()),
  marginBottom: v.optional(v.number()),
  textAlign: v.optional(v.string()),
  borderBottom: v.optional(v.boolean()),
});

const sectionItem = v.object({
  id: v.string(),
  title: v.optional(v.string()),
  subtitle: v.optional(v.string()),
  date: v.optional(v.string()),
  location: v.optional(v.string()),
  description: v.optional(v.string()),
  bullets: v.optional(v.array(v.string())),
});

const section = v.object({
  id: v.string(),
  type: v.string(),
  title: v.string(),
  content: v.optional(v.string()),
  items: v.optional(v.array(sectionItem)),
  order: v.number(),
  style: v.optional(sectionStyle),
});

const globalStyles = v.object({
  fontFamily: v.optional(v.string()),
  fontSize: v.optional(v.number()),
  primaryColor: v.optional(v.string()),
  secondaryColor: v.optional(v.string()),
  accentColor: v.optional(v.string()),
  lineHeight: v.optional(v.number()),
  marginX: v.optional(v.number()),
  marginY: v.optional(v.number()),
  sectionSpacing: v.optional(v.number()),
  template: v.optional(v.string()),
});

export default defineSchema({
  resumes: defineTable({
    userId: v.string(),
    title: v.string(),
    sections: v.array(section),
    globalStyles: globalStyles,
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
