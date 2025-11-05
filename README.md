


## WeeBly — A Modern Full-Stack Blogging App

WeeBly is a colorful and simple blogging platform built with **React**, **Node.js**, and **MongoDB**.
Users can register, log in, create blog posts, upload cover images, comment on posts, and switch between light/dark themes.



###  Tech Stack

#### Frontend

* React + Vite
* Axios for API calls
* React Helmet for SEO
* CSS (gradient theme + dark mode toggle)

####  Backend

* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Bcrypt for password hashing
* CORS + dotenv for configuration



### Folder Structure

```
project/
│
├── backend/
│   ├── server.js
│   ├── .env
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    └── package.json
```



###  Features

 User authentication (Register/Login)
 Create, edit, and delete posts
 Upload post cover images
 Add and view comments
 Author-only edit/delete access
 Light/Dark mode toggle 
 Responsive and colorful UI



###  How to Run Locally

#### 1️ Clone the repository

```bash
git clone https://github.com/yourusername/weebly.git
cd weebly
```

#### 2️ Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=yourSecretKey
```

Start the backend:

```bash
npm run dev
```

 Backend runs on **[http://localhost:4000](http://localhost:4000)**

---

#### 3️ Setup the frontend

```bash
cd ../frontend
npm install
npm run dev
```

 Frontend runs on **[http://localhost:5173](http://localhost:5173)**


###  Deployment Guide

####  Backend (Render)

1. Push code to GitHub
2. Go to [Render.com](https://render.com) → “New Web Service”
3. Connect your GitHub repository
4. Add environment variables:

   * `PORT=4000`
   * `MONGO_URI=your MongoDB Atlas URI`
   * `JWT_SECRET=yourSecretKey`
5. Build command → `npm install`
6. Start command → `node server.js`
7. Deploy 

#### Frontend (Vercel / Netlify)

1. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect your GitHub repo
3. Set build command → `npm run build`
4. Set output directory → `dist`
5. Add environment variable for backend API URL:

   * `VITE_API_BASE_URL=https://your-backend.onrender.com`
6. Deploy 

---

###  Security Notes

* Store JWTs securely (avoid localStorage in production)
* Sanitize user input
* Use HTTPS and environment-based secrets
* Consider using PostgreSQL for larger deployments



###  Author

**Sanjana V**
 Built with using React + Node.js
 `sanjanavelusamy19@gmail.com`

