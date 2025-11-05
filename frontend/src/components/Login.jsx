import React, { useState } from 'react';
import axios from 'axios';
const API = 'http://localhost:4000/api';
export default function Login({ onLogin }){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API+'/login',{ email, password });
      onLogin(res.data.token, res.data.user);
    } catch(e){
      alert('Login failed: ' + (e.response?.data?.message || e.message));
    }
  };
  return (
    <form onSubmit={submit} className="inline-form">
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn">Login</button>
    </form>
  )
}
