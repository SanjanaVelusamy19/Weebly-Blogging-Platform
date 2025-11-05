import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const API = 'http://localhost:4000/api';

export default function PostList({ posts, user, token, onAddComment }) {
  return (
    <div className="post-list">
      <Helmet>
        <title>WeeBly ✍ | Explore Latest Blogs</title>
        <meta
          name="description"
          content="Discover insightful blogs, creative stories, and user journeys on WeeBly."
        />
        <meta
          name="keywords"
          content="blogs, stories, creativity, weebly, react, node"
        />
      </Helmet>

      <h3>Total Posts: {posts.length}</h3>

      {posts.length === 0 && <p>No posts yet. Be the first to share!</p>}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          user={user}
          token={token}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}

function PostCard({ post, user, token, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);

  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${API}/posts/${post._id}/comments`,
        { text: commentText },
        { headers: { Authorization: 'Bearer ' + token } }
      );

      const newComment = { text: commentText, user: { username: user.username } };
      setComments((prev) => [...prev, newComment]);


      if (onAddComment) onAddComment(post._id, newComment);
      setCommentText('');
    } catch (err) {
      console.error(err);
      alert('❌ Error posting comment');
    }
  };

  
  const handleEdit = async () => {
    try {
      await axios.put(
        `${API}/posts/${post._id}`,
        { title: editedTitle, content: editedContent },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      alert('✅ Post updated successfully!');
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('❌ Error updating post');
    }
  };

  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`${API}/posts/${post._id}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      alert('🗑️ Post deleted');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('❌ Error deleting post');
    }
  };

  return (
    <div className="post-card">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Edit title"
            className="edit-input"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit content"
            className="edit-textarea"
          />
          <div className="post-actions">
            <button onClick={handleEdit} className="btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn cancel">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>{post.title}</h3>

          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt="cover"
              className="cover-image"
              style={{
                width: '100%',
                maxHeight: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            />
          )}

          <p>{post.content}</p>
          <p className="author">By {post.author}</p>
          <p className="date">{new Date(post.createdAt).toLocaleString()}</p>
          
          {user?.username === post.author && (
            <div className="post-actions">
              <button onClick={() => setIsEditing(true)} className="btn">
                Edit
              </button>
              <button onClick={handleDelete} className="btn delete">
                Delete
              </button>
            </div>
          )}

          
          <div className="comment-section">
            <h4>Comments</h4>
            {comments.length === 0 && <p>No comments yet.</p>}

            <ul>
              {comments.map((c, i) => (
                <li key={i} className="comment">
                  <strong>{c.user?.displayName || c.user?.username || 'Anonymous'}:</strong> {c.text}
                </li>
              ))}
            </ul>

            {user && (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn">Post</button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
