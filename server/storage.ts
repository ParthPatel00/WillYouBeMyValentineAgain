import { db } from "./db";
import { responses, type InsertResponse, type Response } from "@shared/schema";

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
}

export class DatabaseStorage implements IStorage {
  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db.insert(responses).values(insertResponse).returning();
    return response;
  }
}

export const storage = new DatabaseStorage();
