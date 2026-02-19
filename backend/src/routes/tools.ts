import { Request, Response, Router } from 'express';
import { db } from '../config/firebase';
import { CopingTool } from '../models/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

const router = Router();
const toolsCollection = db.collection('copingTools');

/* -----------------------------------
   GET ALL TOOLS
------------------------------------*/
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, difficulty } = req.query;

    let query: FirebaseFirestore.Query =
      toolsCollection.where('isPremium', '==', false);

    if (category) {
      query = query.where('category', '==', category);
    }

    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    const snapshot = await query.get();

    const tools: CopingTool[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as CopingTool)
    );

    res.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    console.error('Get tools error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tools',
    });
  }
});

/* -----------------------------------
   GET CATEGORIES
------------------------------------*/
router.get('/meta/categories', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 'breathing', name: 'Breathing' },
        { id: 'meditation', name: 'Meditation' },
        { id: 'grounding', name: 'Grounding' },
        { id: 'journaling', name: 'Journaling' },
        { id: 'movement', name: 'Movement' },
        { id: 'cognitive', name: 'Cognitive' },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

/* -----------------------------------
   SEED DEFAULT TOOLS
------------------------------------*/
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const defaultTools: Omit<CopingTool, 'id'>[] = [
      {
        title: '4-7-8 Breathing',
        description: 'Calming breathing exercise',
        category: 'breathing',
        duration: 3,
        content: {
          steps: [
            'Inhale 4 seconds',
            'Hold 7 seconds',
            'Exhale 8 seconds',
          ],
        },
        tags: ['stress'],
        difficulty: 'easy',
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: 'Box Breathing',
        description: 'Navy SEAL breathing technique',
        category: 'breathing',
        duration: 5,
        content: {
          steps: [
            'Inhale 4',
            'Hold 4',
            'Exhale 4',
            'Hold 4',
          ],
        },
        tags: ['focus'],
        difficulty: 'easy',
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: '5-4-3-2-1 Grounding',
        description: 'Use your senses',
        category: 'grounding',
        duration: 5,
        content: {
          steps: [
            '5 things you see',
            '4 things you feel',
            '3 things you hear',
            '2 things you smell',
            '1 thing you taste',
          ],
        },
        tags: ['anxiety'],
        difficulty: 'easy',
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: 'Gratitude Journal',
        description: 'Write 3 good things',
        category: 'journaling',
        duration: 10,
        content: {
          steps: ['Write 3 things you are grateful for'],
        },
        tags: ['positivity'],
        difficulty: 'easy',
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: 'Stretching',
        description: 'Light body movement',
        category: 'movement',
        duration: 10,
        content: {
          steps: ['Stretch arms', 'Stretch legs'],
        },
        tags: ['relax'],
        difficulty: 'easy',
        isPremium: false,
        createdAt: new Date(),
      },
      {
        title: 'Thought Reframing',
        description: 'Change negative thoughts',
        category: 'cognitive',
        duration: 10,
        content: {
          steps: [
            'Identify thought',
            'Challenge thought',
            'Replace thought',
          ],
        },
        tags: ['cbt'],
        difficulty: 'medium',
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
      message: 'Tools seeded successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Seed failed',
    });
  }
});

/* -----------------------------------
   GET SINGLE TOOL (KEEP LAST)
------------------------------------*/
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await toolsCollection.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tool',
    });
  }
});

export default router;
