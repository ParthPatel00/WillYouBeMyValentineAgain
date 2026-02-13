import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.response.create.path, async (req, res) => {
    try {
      const input = api.response.create.input.parse(req.body);
      const response = await storage.createResponse(input);
      res.status(201).json(response);
    } catch (err) {
        // Log error but don't crash, just send 500 or 400
        console.error(err);
        res.status(500).json({ message: "Failed to record response" });
    }
  });

  return httpServer;
}
