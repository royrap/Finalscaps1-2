# 🚀 Deployment Guide - Vercel

This guide will walk you through deploying your Auto-Repair System to Vercel.

## Prerequisites

- ✅ GitHub/GitLab/Bitbucket account
- ✅ Supabase project (your database)
- ✅ Vercel account (free - sign up at vercel.com)

---

## Step 1: Prepare Your Code

### 1.1 Check Your Supabase Configuration

Make sure you have your Supabase credentials ready:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already done)

```powershell
# Navigate to your project folder
cd c:\Users\rafae\Downloads\auto-repair-system

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Auto Repair System"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Name your repository (e.g., `auto-repair-system`)
3. **DO NOT** initialize with README (we already have files)
4. Click **Create repository**

### 2.3 Push to GitHub

```powershell
# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/YOUR-USERNAME/auto-repair-system.git

# Push code
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click **Sign Up** (or **Login**)
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. Click **Add New...** → **Project**
2. Find your `auto-repair-system` repository
3. Click **Import**

### 3.3 Configure Project Settings

Vercel will auto-detect Next.js. You'll see:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

**Leave these as default** - they're correct!

### 3.4 Add Environment Variables

**This is CRITICAL** - click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

**How to add:**
1. Type `NEXT_PUBLIC_SUPABASE_URL` in the "Name" field
2. Paste your Supabase URL in the "Value" field
3. Click **Add**
4. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.5 Deploy!

1. Click **Deploy** button
2. Wait 2-3 minutes for build to complete
3. 🎉 Your site is live!

---

## Step 4: Access Your Application

After deployment completes:

1. Vercel will show you a URL like: `https://auto-repair-system-xxx.vercel.app`
2. Click **Visit** to open your application
3. Test the login and features

---

## Step 5: Connect Your Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Type your domain (e.g., `yourdomain.com`)
4. Click **Add**

### 5.2 Update DNS Settings

Vercel will show you DNS records to add. You need to add these in your domain provider:

**For InfinityFree:**
1. Login to InfinityFree control panel
2. Go to **DNS Management** or **Domain Settings**
3. Add the records Vercel shows you (usually):
   - **Type**: A Record
   - **Name**: @
   - **Value**: `76.76.21.21` (or the IP Vercel shows)
   
   OR
   
   - **Type**: CNAME
   - **Name**: www
   - **Value**: `cname.vercel-dns.com`

**Note:** DNS changes can take 24-48 hours to propagate.

---

## Step 6: Verify Database Connection

After deployment:

1. Visit your Vercel URL
2. Try to login
3. Check admin dashboard
4. Verify data loads correctly

If you see errors, check:
- Environment variables are set correctly in Vercel
- Supabase database is accessible (not paused)
- RLS policies in Supabase allow access

---

## Automatic Deployments

**Good news!** Every time you push to GitHub, Vercel automatically deploys:

```powershell
# Make changes to your code
git add .
git commit -m "Updated feature X"
git push

# Vercel automatically builds and deploys! 🚀
```

---

## Troubleshooting

### Build Fails

**Check build logs** in Vercel dashboard:
- Look for TypeScript errors
- Check for missing dependencies
- Verify environment variables are set

### Database Connection Errors

1. Verify environment variables in Vercel Settings
2. Check Supabase is not paused (free tier pauses after inactivity)
3. Test Supabase connection URL in browser

### 404 Errors on Routes

- This shouldn't happen with Next.js app router
- Check your `app/` directory structure
- Verify `layout.tsx` exists in root

### Images Not Loading

- Already configured with `images: { unoptimized: true }` ✅
- Check image paths are correct

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Your Supabase public/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | For admin operations (keep secret!) |

---

## Cost & Limits

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Custom domains

**Your project should work perfectly on the free tier!**

### Supabase Free Tier Includes:
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50MB file uploads
- ⚠️ Pauses after 1 week inactivity (just visit to wake up)

---

## Quick Commands Cheat Sheet

```powershell
# Check current git status
git status

# Pull latest changes
git pull

# Make changes and deploy
git add .
git commit -m "Your change description"
git push

# View Vercel deployments
# Go to: https://vercel.com/dashboard

# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel
```

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

## Summary Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Application accessible
- [ ] Database connection working
- [ ] Custom domain added (optional)

**Estimated time: 15-30 minutes**

---

**🎉 Congratulations! Your Auto-Repair System is now live on Vercel!**
