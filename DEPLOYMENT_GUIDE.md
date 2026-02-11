# 🚀 Deployment Guide for Logistics Corp Inventory Management System

## 📋 Prerequisites
- GitHub account
- Free accounts on Render and Vercel

## 🛠️ Step-by-Step Deployment

### Step 1: Prepare Your Code (Already Done)
✅ Updated frontend to use environment variables
✅ Created production configuration files
✅ Added deployment configuration files

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click "New repository"
3. Name it `logistics-management-system`
4. Make it Public (required for free tiers)
5. Don't initialize with README (we'll push existing code)

### Step 3: Push Code to GitHub

```bash
cd /Users/kavishka_r/Documents/SpringBoot
git init
git add .
git commit -m "Initial commit: Logistics Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/logistics-management-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Set Up Free Database

#### Option A: PlanetScale (Recommended)
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Click "Create Database"
4. Name: `logistics-db`
5. Region: Choose closest to your users
6. Click "Create Database"
7. Click "Connect" → "Java" → Copy the connection details

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Provision MySQL"
4. Copy the connection details

### Step 5: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Choose your repository
5. Configure:
   - **Name**: `logistics-backend`
   - **Root Directory**: `Backend`
   - **Environment**: Java
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/Backend-0.0.1-SNAPSHOT.jar`

6. Add Environment Variables:
   ```
   DATABASE_URL=jdbc:mysql://YOUR_DB_HOST:3306/logistics-db
   DB_USERNAME=YOUR_DB_USERNAME
   DB_PASSWORD=YOUR_DB_PASSWORD
   EMAIL_USERNAME=shaan.pc1234@gmail.com
   EMAIL_PASSWORD=cprn ihfv rwng geid
   ```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Note your backend URL (e.g., `https://logistics-backend.onrender.com`)

### Step 6: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Project Name**: `logistics-frontend`
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App

6. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
   (Replace with your actual Render backend URL)

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)

### Step 7: Update Frontend with Backend URL

After your backend is deployed:

1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to "Settings" → "Environment Variables"
4. Update `REACT_APP_API_URL` with your actual backend URL
5. Go to "Deployments" → Redeploy the latest deployment

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend URL is correctly set in frontend environment variables

2. **Database Connection**: 
   - Verify database credentials
   - Check if database allows connections from Render's IP addresses

3. **Build Failures**:
   - Check logs in Render/Vercel dashboards
   - Ensure all dependencies are in package.json/pom.xml

4. **API Calls Not Working**:
   - Verify backend is running
   - Check browser console for errors
   - Ensure environment variables are set correctly

## 🔐 Security Notes

- **Never** commit sensitive information like passwords to GitHub
- Use environment variables for all secrets
- The configuration files provided use environment variables for sensitive data

## �� Cost Summary

- **Backend (Render)**: Free tier (sleeps after 15 min inactivity)
- **Frontend (Vercel)**: Free tier
- **Database (PlanetScale/Railway)**: Free tier
- **Total Monthly Cost**: $0

## �� Updating Your Application

To update after making changes:

1. Commit and push changes to GitHub
2. Render will automatically redeploy backend
3. Vercel will automatically redeploy frontend
4. For environment variable changes, manually redeploy from dashboards

## 🎉 You're Done!

Your application should now be live at:
- **Frontend**: `https://your-project-name.vercel.app`
- **Backend API**: `https://your-backend-name.onrender.com`

## 📞 Support

If you encounter issues:
1. Check deployment logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Test API endpoints directly with tools like Postman
