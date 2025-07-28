# Google Directions API Setup

This guide explains how to set up Google Directions API for actual driving routes in the delivery app.

## Prerequisites

1. Google Cloud Platform account
2. Google Maps API key (from the previous setup)

## Setup Steps

### 1. Enable Directions API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Directions API"
5. Click on "Directions API" and enable it

### 2. Update API Key

Replace `YOUR_GOOGLE_MAPS_API_KEY` in `services/directions.ts` with your actual API key:

```typescript
private static API_KEY = 'your-actual-api-key-here';
```

### 3. API Usage

The app will automatically:
- Try to fetch real driving routes from Google Directions API
- Fall back to simulated routes if the API is unavailable
- Show distance and duration information

## Features

### Real Routes
- **Actual driving paths** following roads and traffic rules
- **Accurate distance** and **estimated travel time**
- **Multiple waypoints** support for complex routes

### Fallback Routes
- **Simulated curved paths** when API is unavailable
- **Approximate distance** calculations
- **Estimated duration** based on distance

## API Response Format

The Directions API returns:
```json
{
  "status": "OK",
  "routes": [{
    "legs": [{
      "distance": { "text": "2.3 km" },
      "duration": { "text": "8 mins" }
    }],
    "overview_polyline": {
      "points": "encoded_polyline_string"
    }
  }]
}
```

## Cost Considerations

- **Free tier**: $200 credit per month
- **Directions API**: $5 per 1000 requests
- **Typical usage**: 1 request per delivery route view

## Testing

1. **With API Key**: Real driving routes with accurate data
2. **Without API Key**: Fallback routes with estimated data
3. **Offline**: Simulated routes work without internet

## Troubleshooting

### Common Issues

1. **"REQUEST_DENIED"**: Check API key and enable Directions API
2. **"ZERO_RESULTS"**: No route found between points
3. **"OVER_QUERY_LIMIT"**: API quota exceeded

### Debug Mode

Enable console logging to see API responses:
```typescript
console.log('Directions API response:', data);
```

## Security Notes

- Keep your API key secure
- Set up API key restrictions in Google Cloud Console
- Monitor usage to prevent unexpected charges 