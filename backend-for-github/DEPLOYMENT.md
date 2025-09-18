# Backend Deployment Guide

## Deploy to Railway (Recommended - Free Tier Available)

### Step 1: Prepare Your Code
1. Create a GitHub repository for your project
2. Push all your code to the repository

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect it's a Node.js project

### Step 3: Set Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://tcbogcsszxoywqwyfbbn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYm9nY3NzenhveXdxd3lmYmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIxOTQ0MCwiZXhwIjoyMDczNzk1NDQwfQ.dUMupjym8S8WAzRL_-AAjp56022A-ZE2wL05o4PRILE
```

### Step 4: Deploy
Railway will automatically build and deploy your app. You'll get a URL like:
`https://your-app-name.up.railway.app`

### Step 5: Test Your API
Test your deployed API:
```bash
curl https://your-app-name.up.railway.app/health
```

---

## Alternative: Deploy to Render

### Step 1: Go to Render
1. Go to [Render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository

### Step 2: Configure Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node

### Step 3: Set Environment Variables
Add the same environment variables as above in Render's dashboard.

---

## Alternative: Deploy to Heroku

### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

### Step 2: Create Heroku App
```bash
heroku create your-app-name
```

### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set SUPABASE_URL=https://tcbogcsszxoywqwyfbbn.supabase.co
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Deploy
```bash
git push heroku main
```

---

## After Deployment

Once your backend is deployed, you'll need to:

1. **Get your backend URL** (e.g., `https://your-app.railway.app`)
2. **Update the frontend** to use this URL instead of localhost
3. **Redeploy the frontend**

The backend URL will be something like:
- Railway: `https://your-app-name.up.railway.app`
- Render: `https://your-app-name.onrender.com`
- Heroku: `https://your-app-name.herokuapp.com`

Let me know your backend URL once deployed, and I'll update the frontend!