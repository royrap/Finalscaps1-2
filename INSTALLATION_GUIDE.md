# Quick Installation Guide - Talyer Analytics Feature

## Prerequisites
- Node.js 18+ installed
- Supabase account with database access
- Gemini API key

## Step 1: Install Required Packages

```bash
npm install recharts
# or
pnpm install recharts
# or
yarn add recharts
```

## Step 2: Set Environment Variables

Add to your `.env.local` file:

```env
# Gemini AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBN8VKuOYcmrdzJ5T3KpkxaCa-PNs3Wk8o

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Apply Database RLS Policies

Run in Supabase SQL Editor:

```sql
-- Enable RLS and grant admin access to payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_policy" ON payments;
DROP POLICY IF EXISTS "Admins full access to payments" ON payments;

CREATE POLICY "Admins full access to payments"
ON payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);
```

## Step 4: Verify File Structure

Ensure these files exist:

```
✅ lib/gemini.ts
✅ app/api/admin/analytics/talyer-registration/route.ts
✅ app/admin/analytics/talyer-registration/page.tsx
✅ components/AdminNavigation.tsx (updated)
```

## Step 5: Test the Feature

1. Start your development server:
```bash
npm run dev
```

2. Login as super_admin or admin

3. Navigate to: `http://localhost:3000/admin/analytics/talyer-registration`

4. You should see:
   - Loading spinner (during AI analysis)
   - Analytics dashboard with charts
   - AI-generated insights
   - Predictions with confidence levels

## Step 6: Verify Gemini API

Test the Gemini integration:

```bash
# In browser console
fetch('/api/admin/analytics/talyer-registration?range=all')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "totalShops": number,
  "analytics": { ... },
  "predictions": [ ... ]
}
```

## Troubleshooting

### Issue: "Cannot find module 'recharts'"
**Solution:**
```bash
npm install recharts --save
```

### Issue: "Gemini API error"
**Solution:**
- Check API key is correct
- Verify environment variable is set
- Check API quota limits

### Issue: "No payments found"
**Solution:**
- Apply RLS policies (Step 3)
- Verify user role is 'super_admin' or 'admin'
- Check database has shop data

### Issue: Charts not displaying
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: 401 Unauthorized
**Solution:**
- Ensure you're logged in
- Verify token is valid
- Check Supabase credentials

## Quick Checks

Run these checks to verify setup:

```bash
# 1. Check if recharts is installed
npm list recharts

# 2. Check environment variables
echo $NEXT_PUBLIC_GEMINI_API_KEY

# 3. Check if files exist
ls -la lib/gemini.ts
ls -la app/api/admin/analytics/talyer-registration/route.ts
ls -la app/admin/analytics/talyer-registration/page.tsx

# 4. Check for TypeScript errors
npm run build
```

## Testing Checklist

- [ ] Navigate to talyer analytics page
- [ ] See loading spinner
- [ ] Charts render properly
- [ ] AI insights displayed
- [ ] Time range filter works
- [ ] Refresh button works
- [ ] Mobile responsive
- [ ] No console errors

## Next Steps

1. Add sample shop data to test
2. Customize chart colors if needed
3. Add export functionality (optional)
4. Configure email alerts (optional)

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are in place
3. Ensure environment variables are set
4. Check Gemini API status
5. Review Supabase logs

---

**Setup complete! 🎉**

Your Talyer Registration Analytics feature should now be fully functional.
