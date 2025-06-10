import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  loginTime: timestamp("login_time").notNull().defaultNow(),
  logoutTime: timestamp("logout_time"),
});

export const insertVisitorSchema = createInsertSchema(visitors).omit({
}).extend({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"),
});

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

