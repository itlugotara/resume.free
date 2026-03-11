import { query, mutation } from "./_generated/server";
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

const sectionValidator = v.object({
  id: v.string(),
  type: v.string(),
  title: v.string(),
  content: v.optional(v.string()),
  items: v.optional(v.array(sectionItem)),
  order: v.number(),
  style: v.optional(sectionStyle),
});

const globalStylesValidator = v.object({
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

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    sections: v.array(sectionValidator),
    globalStyles: globalStylesValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("resumes", {
      userId: args.userId,
      title: args.title,
      sections: args.sections,
      globalStyles: args.globalStyles,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const get = query({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resumes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const updateSections = mutation({
  args: {
    id: v.id("resumes"),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      sections: args.sections,
      updatedAt: Date.now(),
    });
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("resumes"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const updateGlobalStyles = mutation({
  args: {
    id: v.id("resumes"),
    globalStyles: globalStylesValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      globalStyles: args.globalStyles,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
