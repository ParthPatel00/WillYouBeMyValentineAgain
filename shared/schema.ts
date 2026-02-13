import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  accepted: boolean("accepted").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  accepted: true,
});

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
