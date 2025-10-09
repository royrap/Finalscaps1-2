# 🚀 Quick Deploy to Vercel - Cheat Sheet

## TL;DR - 5 Minute Deploy

### 1️⃣ Push to GitHub (First Time)
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/auto-repair-system.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy on Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New... → Project"**
4. Import your repository
5. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Key
6. Click **Deploy**
7. Wait 2-3 minutes
8. ✅ Done!

---

## 🔑 Environment Variables (Required)

Get these from: https://app.supabase.com/project/_/settings/api

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
```

---

## 🔄 Future Updates

```powershell
# Make changes to your code
git add .
git commit -m "Updated feature"
git push
# Vercel auto-deploys! 🎉
```

---

## 📱 Your URLs

After deployment, you'll get:
- **Vercel URL**: `https://your-project.vercel.app`
- Can add your custom domain in Vercel settings

---

## ⚡ Quick Commands

```powershell
# Run locally
npm run dev

# Test build
npm run build

# Check status
git status

# View logs
# Go to vercel.com/dashboard
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check build logs in Vercel dashboard |
| Database errors | Verify env variables in Vercel settings |
| 404 on routes | Check `app/` folder structure |
| Images broken | Already fixed with `unoptimized: true` |

---

## 📞 Get Help

- **Full Guide**: See `DEPLOYMENT_GUIDE.md`
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Dashboard**: https://app.supabase.com

---

**Total Time: ~15 minutes** ⏱️
