import React, { useState } from 'react';

export default function CreatePost({ onCreate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill out all fields');
      return;
    }
    const success = await onCreate(title, content, coverImage);
    if (success) {
      setTitle('');
      setContent('');
      setCoverImage(null);
      setPreview(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && <img src={preview} alt="Preview" className="cover-preview" />}
      <button type="submit" className="btn">Publish</button>
    </form>
  );
}
