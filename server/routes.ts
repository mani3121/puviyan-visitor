import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitorSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all visitors
  app.get("/api/visitors", async (req, res) => {
    try {
      const visitors = await storage.getAllVisitors();
      res.json(visitors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visitors" });
    }
  });

  // Create new visitor (login)
  app.post("/api/visitors", async (req, res) => {
    try {
      const validatedData = insertVisitorSchema.parse(req.body);
      const visitor = await storage.createVisitor(validatedData);
      res.status(201).json(visitor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create visitor" });
      }
    }
  });

  // Update visitor logout
  app.patch("/api/visitors/:id/logout", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid visitor ID" });
      }

      const visitor = await storage.updateVisitorLogout(id);
      if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
      }

      res.json(visitor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update visitor logout" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
