// =====================================================
// GEMINI AI API INTEGRATION
// For analytics and predictions
// =====================================================

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBN8VKuOYcmrdzJ5T3KpkxaCa-PNs3Wk8o'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export interface ShopAnalyticsData {
  shop_name: string
  date_registered: string
  barangay?: string
  city?: string
  province?: string
  latitude?: number
  longitude?: number
}

export interface AnalyticsInsight {
  topBarangays: Array<{ name: string; count: number }>
  monthlyTrends: Array<{ month: string; count: number }>
  predictions: string[]
  growthAreas: string[]
  summary: string
}

/**
 * Call Gemini API to generate content
 */
export async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('No response from Gemini API')
    }

    return text
  } catch (error) {
    console.error('Gemini API call failed:', error)
    throw error
  }
}

/**
 * Analyze talyer registration data using Gemini AI
 */
export async function analyzeTalyerRegistrations(shops: ShopAnalyticsData[]): Promise<AnalyticsInsight> {
  try {
    // Prepare data summary for Gemini
    const locationCounts = shops.reduce((acc, shop) => {
      const location = shop.barangay || shop.city || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get monthly registration data
    const monthlyData = shops.reduce((acc, shop) => {
      const date = new Date(shop.date_registered)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const prompt = `
You are an analytics expert analyzing auto repair shop (talyer) registration data in the Philippines.

REGISTRATION DATA:
- Total registered shops: ${shops.length}
- Locations: ${JSON.stringify(locationCounts, null, 2)}
- Monthly registrations: ${JSON.stringify(monthlyData, null, 2)}

TASK:
Analyze this data and provide insights in JSON format with the following structure:

{
  "topBarangays": [{"name": "Barangay Name", "count": number}],
  "predictions": ["prediction 1", "prediction 2", "prediction 3"],
  "growthAreas": ["area 1", "area 2", "area 3"],
  "summary": "Brief summary of key findings"
}

Requirements:
1. Identify top 5 locations with most registrations
2. Predict 3-5 areas where new shops are likely to register based on current patterns
3. Identify 3 growth areas with increasing registration trends
4. Provide a 2-3 sentence summary

Respond ONLY with valid JSON, no markdown formatting.
`

    const response = await callGeminiAPI(prompt)
    
    // Try to parse JSON from response
    let parsedResponse: any
    try {
      // Remove markdown code blocks if present
      const jsonText = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', response)
      // Fallback to manual parsing
      parsedResponse = {
        topBarangays: Object.entries(locationCounts)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([name, count]) => ({ name, count: count as number })),
        predictions: ['Based on current trends, growth expected in urban areas', 'Suburban expansion likely', 'City outskirts showing potential'],
        growthAreas: ['Metro Manila', 'Cebu', 'Davao'],
        summary: 'Registration data shows concentration in urban centers with potential for suburban expansion.',
      }
    }

    // Add monthly trends from actual data
    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        count: count as number,
      }))

    return {
      topBarangays: parsedResponse.topBarangays || [],
      monthlyTrends,
      predictions: parsedResponse.predictions || [],
      growthAreas: parsedResponse.growthAreas || [],
      summary: parsedResponse.summary || 'Analysis complete',
    }
  } catch (error) {
    console.error('Error analyzing talyer registrations:', error)
    throw error
  }
}

/**
 * Generate predictions based on historical data
 */
export async function generatePredictions(
  monthlyData: Array<{ month: string; count: number }>
): Promise<{ prediction: string; confidence: string }[]> {
  try {
    const prompt = `
Analyze this monthly registration data for auto repair shops (talyers) and make predictions:

${JSON.stringify(monthlyData, null, 2)}

Provide 3-5 specific predictions about future registration trends. Format as JSON array:
[
  {"prediction": "specific prediction", "confidence": "high/medium/low"},
  ...
]

Consider factors like:
- Growth rate trends
- Seasonal patterns
- Market saturation indicators

Respond ONLY with valid JSON array, no markdown.
`

    const response = await callGeminiAPI(prompt)
    const jsonText = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      return JSON.parse(jsonText)
    } catch {
      // Fallback
      return [
        { prediction: 'Steady growth expected in the next quarter', confidence: 'medium' },
        { prediction: 'Urban areas will see increased registrations', confidence: 'high' },
        { prediction: 'Suburban expansion likely in 6-12 months', confidence: 'medium' },
      ]
    }
  } catch (error) {
    console.error('Error generating predictions:', error)
    throw error
  }
}
