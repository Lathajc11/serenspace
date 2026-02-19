import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { Mood, Insight } from '../models/types';

const moodsCollection = db.collection('moods');
const insightsCollection = db.collection('insights');

/* =====================================================
   GENERATE INSIGHTS
===================================================== */
export const generateInsights = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false });
      return;
    }

    // Get moods
    const snapshot = await moodsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const moods = snapshot.docs.map(d => d.data() as Mood);

    // ❌ No moods → no insights
    if (moods.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    // -------------------------------
    // Calculations
    // -------------------------------
    const avg =
      moods.reduce((s, m) => s + m.score, 0) / moods.length;

    const emotionCount: Record<string, number> = {};
    moods.forEach(m => {
      emotionCount[m.emotion] =
        (emotionCount[m.emotion] || 0) + 1;
    });

    const topEmotion = Object.keys(emotionCount).sort(
      (a, b) => emotionCount[b] - emotionCount[a]
    )[0];

    // -------------------------------
    // Build 3 insights
    // -------------------------------

    const insights: Omit<Insight, 'id'>[] = [
      {
        userId,
        type: 'trend',
        title: 'Mood Summary',
        description: `Your average mood score is ${avg.toFixed(1)}`,
        data: {
          averageMood: Number(avg.toFixed(1)),
          moodTrend: 'stable',
          topEmotions: [topEmotion],
          period: '30d',
        },
        isRead: false,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
      {
        userId,
        type: 'pattern',
        title: 'Emotion Pattern',
        description: `You often feel ${topEmotion} in recent check-ins`,
        data: {
          averageMood: Number(avg.toFixed(1)),
          moodTrend: 'stable',
          topEmotions: [topEmotion],
          period: '30d',
        },
        isRead: false,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
      {
        userId,
        type: 'suggestion',
        title: 'Try This Today',
        description: 'Try a 5-minute breathing or grounding exercise',
        data: {
          averageMood: Number(avg.toFixed(1)),
          moodTrend: 'stable',
          topEmotions: [topEmotion],
          period: 'today',
        },
        isRead: false,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    ];

    // -------------------------------
    // Delete old insights
    // -------------------------------
    const old = await insightsCollection
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    old.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    // -------------------------------
    // Save new insights
    // -------------------------------
    const saved: Insight[] = [];

    for (const i of insights) {
      const ref = await insightsCollection.add(i);
      saved.push({ id: ref.id, ...i });
    }

    res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
    });
  }
};

/* =====================================================
   GET INSIGHTS
===================================================== */
export const getInsights = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false });
      return;
    }

    const snapshot = await insightsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const insights = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights',
    });
  }
};

/* =====================================================
   MARK AS READ
===================================================== */
export const markInsightRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await insightsCollection.doc(id).update({
      isRead: true,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark read',
    });
  }
};
