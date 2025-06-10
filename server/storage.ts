import { visitors, type Visitor, type InsertVisitor } from "@shared/schema";

export interface IStorage {
  getVisitor(id: number): Promise<Visitor | undefined>;
  getAllVisitors(): Promise<Visitor[]>;
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  updateVisitorLogout(id: number): Promise<Visitor | undefined>;
}

export class MemStorage implements IStorage {
  private visitors: Map<number, Visitor>;
  private currentId: number;

  constructor() {
    this.visitors = new Map();
    this.currentId = 1;
  }

  async getVisitor(id: number): Promise<Visitor | undefined> {
    return this.visitors.get(id);
  }

  async getAllVisitors(): Promise<Visitor[]> {
    return Array.from(this.visitors.values()).sort((a, b) => 
      new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    );
  }

  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const id = this.currentId++;
    const visitor: Visitor = {
      ...insertVisitor,
      id,
      loginTime: new Date(),
      logoutTime: null,
    };
    this.visitors.set(id, visitor);
    return visitor;
  }

  async updateVisitorLogout(id: number): Promise<Visitor | undefined> {
    const visitor = this.visitors.get(id);
    if (!visitor) {
      return undefined;
    }
    
    const updatedVisitor: Visitor = {
      ...visitor,
      logoutTime: new Date(),
    };
    
    this.visitors.set(id, updatedVisitor);
    return updatedVisitor;
  }
}

export const storage = new MemStorage();
