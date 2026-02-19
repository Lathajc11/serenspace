import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Mood } from '../models/types';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const moodsCollection = db.collection('moods');
const usersCollection = db.collection('users');

/* ----------------------------------------
   CREATE MOOD
---------------------------------------- */
export const createMood = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { score, emotion, note, tags } = req.body;

    if (!score || score < 1 || score > 10) {
      res.status(400).json({ success: false, error: 'Score must be between 1 and 10' });
      return;
    }

    if (!emotion) {
      res.status(400).json({ success: false, error: 'Emotion is required' });
      return;
    }

    const now = Timestamp.now();

    const moodData: Omit<Mood, 'id'> = {
      userId,
      score,
      emotion,
      note: note || '',
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
    };

    // Save mood
    const docRef = await moodsCollection.add(moodData);

    // Ensure user document exists
    await usersCollection.doc(userId).set(
      {
        streakDays: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckIn: now,
      },
      { merge: true }
    );

    // Update streak
    await updateUserStreak(userId);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...moodData },
      message: 'Mood entry created successfully',
    });
  } catch (error) {
    console.error('Create mood error:', error);
    res.status(500).json({ success: false, error: 'Failed to create mood entry' });
  }
};

/* ----------------------------------------
   GET MOODS
---------------------------------------- */
export const getMoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const days = Number(req.query.days) || 30;
    const since = Timestamp.fromMillis(
      Date.now() - days * 24 * 60 * 60 * 1000
    );

    const snapshot = await moodsCollection
      .where('userId', '==', userId)
      .where('createdAt', '>=', since)
      .orderBy('createdAt', 'desc')
      .get();

    const moods = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data: moods });
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch moods' });
  }
};

/* ----------------------------------------
   GET STATS
---------------------------------------- */
export const getMoodStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) return;

    const snapshot = await moodsCollection
      .where('userId', '==', userId)
      .get();

    const moods = snapshot.docs.map(d => d.data() as Mood);

    if (moods.length === 0) {
      res.json({
        success: true,
        data: {
          averageScore: 0,
          totalEntries: 0,
          topEmotion: null,
          trend: 'stable',
        },
      });
      return;
    }

    const avg =
      moods.reduce((s, m) => s + m.score, 0) / moods.length;

    const emotionCount: any = {};
    moods.forEach(m => {
      emotionCount[m.emotion] = (emotionCount[m.emotion] || 0) + 1;
    });

    const topEmotion = Object.keys(emotionCount).sort(
      (a, b) => emotionCount[b] - emotionCount[a]
    )[0];

    res.json({
      success: true,
      data: {
        averageScore: Math.round(avg * 10) / 10,
        totalEntries: moods.length,
        topEmotion,
        trend: 'stable',
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

/* ----------------------------------------
   UPDATE MOOD
---------------------------------------- */
export const updateMood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await moodsCollection.doc(id).update({
      ...req.body,
      updatedAt: Timestamp.now(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

/* ----------------------------------------
   DELETE MOOD
---------------------------------------- */
export const deleteMood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await moodsCollection.doc(id).delete();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

/* ----------------------------------------
   HELPERS
---------------------------------------- */
async function updateUserStreak(userId: string) {
  const userRef = usersCollection.doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return;

  const data: any = userSnap.data();
  const last = data.lastCheckIn?.toMillis() || 0;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  let streak = 1;

  if (now - last < day * 2) {
    streak = (data.streakDays || 0) + 1;
  }

  await userRef.set(
    {
      streakDays: streak,
      totalCheckIns: FieldValue.increment(1),
      lastCheckIn: Timestamp.now(),
    },
    { merge: true }
  );
}
