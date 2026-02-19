import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Post } from '../models/types';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const postsCollection = db.collection('posts');
const usersCollection = db.collection('users');

/* =====================================================
   CREATE POST
===================================================== */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { content, isAnonymous = true } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Content is required' });
      return;
    }

    const userDoc = await usersCollection.doc(userId).get();
    const userData = userDoc.data();

    const displayName = isAnonymous
      ? 'Anonymous'
      : userData?.displayName || 'User';

    const now = Timestamp.now();

    const postData: Omit<Post, 'id'> = {
      authorId: userId,
      content: content.trim(),
      isAnonymous,
      displayName,
      likes: 0,
      likedBy: [],
      repliesCount: 0,
      createdAt: now,
      updatedAt: now,
      isModerated: false,
      isDeleted: false,
    };

    const docRef = await postsCollection.add(postData);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...postData },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
};

/* =====================================================
   GET POSTS (COMMUNITY FEED)
===================================================== */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const snapshot = await postsCollection
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
};

/* =====================================================
   GET MY POSTS
===================================================== */
export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const snapshot = await postsCollection
      .where('authorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch your posts' });
  }
};

/* =====================================================
   LIKE / UNLIKE
===================================================== */
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false });
      return;
    }

    const doc = await postsCollection.doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ success: false });
      return;
    }

    const post = doc.data() as Post;
    const liked = post.likedBy.includes(userId);

    if (liked) {
      await postsCollection.doc(id).update({
        likes: FieldValue.increment(-1),
        likedBy: FieldValue.arrayRemove(userId),
      });
      res.json({ success: true, data: { liked: false } });
    } else {
      await postsCollection.doc(id).update({
        likes: FieldValue.increment(1),
        likedBy: FieldValue.arrayUnion(userId),
      });
      res.json({ success: true, data: { liked: true } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   DELETE POST
===================================================== */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false });
      return;
    }

    await postsCollection.doc(id).update({
      isDeleted: true,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   REPORT POST
===================================================== */
export const reportPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false });
      return;
    }

    await db.collection('reports').add({
      postId: id,
      reportedBy: userId,
      createdAt: Timestamp.now(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
