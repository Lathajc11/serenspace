import { Request, Response } from "express";
import { db } from "../config/firebase";
import { CopingTool } from "../models/types";

const toolsCollection = db.collection("copingTools");

/* ================================
   GET ALL TOOLS
================================ */
export const getTools = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let query: any = toolsCollection.where("isPremium", "==", false);

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();

    const tools: CopingTool[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as CopingTool[];

    res.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    console.error("Get tools error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tools",
    });
  }
};

/* ================================
   SEED DEFAULT TOOLS
================================ */
export const seedTools = async (_req: Request, res: Response) => {
  try {
    const defaultTools: Omit<CopingTool, "id">[] = [
      {
        title: "4-7-8 Breathing",
        description: "Calms anxiety and helps you relax",
        category: "breathing",
        duration: 3,
        content: {
          steps: [
            "Inhale for 4 seconds",
            "Hold for 7 seconds",
            "Exhale for 8 seconds",
            "Repeat 4 times",
          ],
        },
        tags: ["stress", "anxiety"],
        difficulty: "easy",
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: "Box Breathing",
        description: "Improve focus and calm",
        category: "breathing",
        duration: 5,
        content: {
          steps: [
            "Inhale 4 sec",
            "Hold 4 sec",
            "Exhale 4 sec",
            "Hold 4 sec",
          ],
        },
        tags: ["focus"],
        difficulty: "easy",
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: "5-4-3-2-1 Grounding",
        description: "Ground yourself using senses",
        category: "grounding",
        duration: 5,
        content: {
          steps: [
            "5 things you see",
            "4 things you feel",
            "3 things you hear",
            "2 things you smell",
            "1 thing you taste",
          ],
        },
        tags: ["panic"],
        difficulty: "easy",
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: "Gratitude Journaling",
        description: "Write 3 things you’re grateful for",
        category: "journaling",
        duration: 10,
        content: {
          steps: ["Write 3 good things today"],
        },
        tags: ["positivity"],
        difficulty: "easy",
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: "Thought Reframing",
        description: "Change negative thoughts",
        category: "cognitive",
        duration: 10,
        content: {
          steps: [
            "Identify negative thought",
            "Replace with balanced thought",
          ],
        },
        tags: ["cbt"],
        difficulty: "medium",
        isPremium: false,
        createdAt: new Date(),
      },
    ];

    const batch = db.batch();

    defaultTools.forEach((tool) => {
      const ref = toolsCollection.doc();
      batch.set(ref, tool);
    });

    await batch.commit();

    res.json({
      success: true,
      message: "Tools seeded",
    });
  } catch (error) {
    console.error("Seed tools error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed tools",
    });
  }
};
