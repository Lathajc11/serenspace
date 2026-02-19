import { useState, useEffect } from 'react';
import { postApi, type Post } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Send, Heart, MoreHorizontal, Flag, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/* ✅ SAFE DATE CONVERTER */
function toDate(value: any): Date {
  if (!value) return new Date();

  if (value.seconds) {
    return new Date(value.seconds * 1000);
  }

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return new Date();
  }

  return d;
}

export default function CommunityPage(): JSX.Element {
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await postApi.getAll(20);

      // normalize dates
      const fixed = data.map(p => ({
        ...p,
        createdAt: p.createdAt || new Date().toISOString(),
        likedBy: p.likedBy || [],
      }));

      setPosts(fixed);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim()) return;

    setSubmitting(true);
    try {
      const post = await postApi.create({
        content: newPost.trim(),
        isAnonymous,
      });

      setPosts([post, ...posts]);
      setNewPost('');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(postId: string) {
    try {
      const result = await postApi.toggleLike(postId);

      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: result.liked ? p.likes + 1 : p.likes - 1,
            likedBy: result.liked
              ? [...p.likedBy, currentUser!.uid]
              : p.likedBy.filter(id => id !== currentUser!.uid),
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post?')) return;

    try {
      await postApi.delete(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReport(postId: string) {
    if (!confirm('Report this post?')) return;

    try {
      await postApi.report(postId, 'Inappropriate content');
      alert('Post reported');
    } catch (err) {
      console.error(err);
    }
  }

  function hasLiked(post: Post) {
    return currentUser && post.likedBy.includes(currentUser.uid);
  }

  function isAuthor(post: Post) {
    return currentUser && post.authorId === currentUser.uid;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-gray-500">
          Share and connect with others
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* NEW POST */}
      <div className="seren-card p-6">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share something..."
            className="seren-input min-h-[100px] mb-4"
            maxLength={1000}
          />

          <div className="flex justify-between items-center">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
              />
              Anonymous
            </label>

            <button
              type="submit"
              disabled={!newPost.trim() || submitting}
              className="seren-button-primary"
            >
              <Send size={16} className="mr-1" />
              Post
            </button>
          </div>
        </form>
      </div>

      {/* POSTS */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">
          No posts yet
        </p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="seren-card p-6">

            <div className="flex justify-between mb-2">
              <div className="font-medium">
                {post.displayName}
              </div>

              <div className="text-xs text-gray-500">
                {formatDistanceToNow(
                  toDate(post.createdAt),
                  { addSuffix: true }
                )}
              </div>
            </div>

            <p className="mb-4">{post.content}</p>

            <div className="flex gap-4">

              <button
                onClick={() => handleLike(post.id)}
                className={`flex gap-1 items-center ${
                  hasLiked(post) ? 'text-red-500' : ''
                }`}
              >
                <Heart size={16} />
                {post.likes}
              </button>

              {isAuthor(post) ? (
                <button onClick={() => handleDelete(post.id)}>
                  <Trash2 size={16} />
                </button>
              ) : (
                <button onClick={() => handleReport(post.id)}>
                  <Flag size={16} />
                </button>
              )}

            </div>

          </div>
        ))
      )}

    </div>
  );
}
