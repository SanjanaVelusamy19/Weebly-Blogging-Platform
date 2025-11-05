import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostList from './components/PostList';
import CreatePost from './components/CreatePost';
import Login from './components/Login';
import Register from './components/Register';
import { Helmet } from 'react-helmet-async';


const API = 'http://localhost:4000/api';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  
  useEffect(() => {
    axios.get(`${API}/posts`)
      .then(res => setPosts(res.data))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

 
  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  
  const createPost = async (title, content, coverImage) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (coverImage) formData.append('coverImage', coverImage);

      const res = await axios.post(`${API}/posts`, formData, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setPosts(prev => [res.data, ...prev]);
      return true;
    } catch (e) {
      alert('Error creating post: ' + (e.response?.data?.message || e.message));
      return false;
    }
  };

  
  const addComment = async (postId, text) => {
    try {
      const res = await axios.post(`${API}/posts/${postId}/comments`, { text }, {
        headers: { Authorization: 'Bearer ' + token }
      });
  
      setPosts(prev =>
        prev.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), res.data] } : p)
      );
    } catch (err) {
      alert('Error adding comment: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>

      <Helmet>
          <title>WeeBly ✍ | Share Your Journey</title>
          <meta name="description" content="WeeBly is a modern blogging platform for sharing ideas, stories, and creativity." />
          <meta name="keywords" content="blog, writing, stories, react, node, weebly" />
      </Helmet>

      <header className="header">
  <h1 className="logo">WeeBly✍</h1>

  <div className="header-right">
    <button
      className="toggle-mode"
      onClick={() => setDarkMode(!darkMode)}
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>

    <div className="auth">
      {user ? (
        <>
          <span className="welcome">Hi, {user.displayName || user.username}</span>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <Register onLogin={handleLogin} />
        </>
      )}
    </div>
  </div>
</header>
  

      <main className="main">
        <aside className="sidebar">
          <h2>Create</h2>
          {user ? (
            <CreatePost onCreate={createPost} />
          ) : (
            <p>Login to create posts.</p>
          )}
          <div className="about-card">
            <h2>About</h2>
            <p>Share your journey❤️</p>
          </div>
        </aside>

        <section className="content">
          <PostList posts={posts} user={user} token={token} onAddComment={addComment} />
        </section>
      </main>

      <footer className="footer">
        <p>"Don't focus on having a great blog, focus on producing a blog that's great for your readers"</p>
      </footer>
    </div>
  );
}
