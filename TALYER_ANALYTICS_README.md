# Talyer Registration Analytics - AI-Powered Dashboard

## Overview
A comprehensive analytics dashboard powered by Google's Gemini AI that analyzes auto repair shop (talyer) registration data to provide insights and predictions.

## Features

### 📊 **Data Visualization**
- **Bar Chart**: Top 5 barangays with most registrations
- **Pie Chart**: Distribution of registrations by location
- **Line Graph**: Monthly registration trends over time

### 🤖 **AI-Powered Insights (Gemini)**
- Analyzes registration patterns across locations
- Identifies top performing barangays
- Generates growth predictions
- Recommends high-potential areas for expansion
- Provides confidence levels for predictions

### 🔍 **Key Metrics**
- Total registered talyers
- Top registration location
- Number of identified growth areas
- AI-generated summary

### ⏱️ **Time Range Filters**
- **Last 7 Days** (Weekly)
- **Last 30 Days** (Monthly)
- **Last Year** (Yearly)
- **All Time**

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Charts**: Recharts library
- **AI**: Google Gemini Pro API
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui

## File Structure

```
auto-repair-system/
├── app/
│   ├── admin/
│   │   └── analytics/
│   │       └── talyer-registration/
│   │           └── page.tsx                    # Main analytics dashboard
│   └── api/
│       └── admin/
│           └── analytics/
│               └── talyer-registration/
│                   └── route.ts                # API endpoint for fetching analytics
├── lib/
│   └── gemini.ts                               # Gemini AI integration utilities
└── components/
    └── AdminNavigation.tsx                     # Updated with analytics link
```

## API Endpoints

### GET `/api/admin/analytics/talyer-registration`

**Query Parameters:**
- `range`: Time range filter (`weekly`, `monthly`, `yearly`, `all`)

**Response:**
```json
{
  "totalShops": 45,
  "shops": [...],
  "analytics": {
    "topBarangays": [
      { "name": "Barangay 1", "count": 15 }
    ],
    "monthlyTrends": [
      { "month": "2025-01", "count": 5 }
    ],
    "predictions": ["Prediction 1", "Prediction 2"],
    "growthAreas": ["Area 1", "Area 2"],
    "summary": "AI-generated summary..."
  },
  "predictions": [
    {
      "prediction": "Specific prediction",
      "confidence": "high"
    }
  ],
  "timeRange": "all",
  "lastUpdated": "2025-10-10T12:00:00Z"
}
```

## Gemini AI Integration

### Environment Variable
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBN8VKuOYcmrdzJ5T3KpkxaCa-PNs3Wk8o
```

### Key Functions

#### `analyzeTalyerRegistrations(shops)`
Analyzes shop registration data and returns:
- Top performing locations
- Monthly registration trends
- Growth predictions
- Area recommendations

#### `generatePredictions(monthlyData)`
Generates specific predictions with confidence levels based on historical trends.

## Usage

### Accessing the Dashboard

1. Navigate to Super Admin panel
2. Click "Talyer Analytics 🤖" in the navigation
3. Select desired time range
4. View AI-generated insights and visualizations

### Understanding the Data

**Top Barangays Chart**: Shows which areas have the most registered talyers
**Distribution Pie Chart**: Visualizes market share by location
**Growth Trends Line**: Displays registration patterns over time
**AI Predictions**: Gemini-generated forecasts with confidence levels
**Growth Areas**: Regions identified as having growth potential

## Error Handling

The system handles various error scenarios:
- **No Data Available**: Displays friendly message
- **API Failures**: Shows error alert with retry option
- **Gemini API Errors**: Falls back to basic analytics
- **Network Issues**: Provides clear error messages

## Mobile Responsiveness

The dashboard is fully responsive:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ Large screens (1440px+)

## Performance Optimizations

- **Lazy Loading**: Charts load on-demand
- **API Caching**: Reduces redundant Gemini calls
- **Responsive Charts**: Auto-resize based on viewport
- **Loading States**: Clear feedback during data fetch

## Future Enhancements

- [ ] Export analytics reports (PDF/CSV)
- [ ] Email alerts for significant trends
- [ ] Comparative analysis between regions
- [ ] Real-time registration tracking
- [ ] Integration with Google Maps
- [ ] Multi-language support for predictions

## Security

- ✅ Admin-only access (Role-based)
- ✅ API authentication required
- ✅ RLS policies on database
- ✅ Environment variable for API keys
- ✅ Input validation and sanitization

## Troubleshooting

### Common Issues

**Issue**: "No payments found"
**Solution**: Check RLS policies on payments table

**Issue**: "Gemini API error"
**Solution**: Verify API key in environment variables

**Issue**: Charts not displaying
**Solution**: Ensure recharts is installed: `npm install recharts`

**Issue**: 403 Forbidden
**Solution**: Verify user has super_admin or admin role

## Support

For issues or questions:
1. Check console logs for errors
2. Verify API key is valid
3. Ensure database has shop data
4. Check network tab for failed requests

## Credits

- **AI**: Google Gemini Pro
- **Charts**: Recharts
- **UI**: shadcn/ui
- **Icons**: Lucide React

---

**Built with ❤️ for TalyerOTG Platform**

