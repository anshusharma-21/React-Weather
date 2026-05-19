# 🌤️ Stratos Weather

A professional, advanced weather dashboard built with **React 18** + **Tailwind CSS 3**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start

# 3. Open in browser
# → http://localhost:3000
```

### Production Build

```bash
npm run build
# Output is in /build folder — deploy anywhere (Vercel, Netlify, GitHub Pages)
```

---

## 📁 Project Structure

```
stratos-weather/
├── public/
│   └── index.html          # HTML shell
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top nav with city search + unit toggle
│   │   ├── AlertBanner.jsx     # Pulsing weather alert bar
│   │   ├── HeroCard.jsx        # Main temp + weather display
│   │   ├── AQICard.jsx         # Air quality index card
│   │   ├── UVCard.jsx          # UV index with scale bar
│   │   ├── VisibilityCard.jsx  # Visibility + dew point
│   │   ├── MetricsGrid.jsx     # Humidity, wind, pressure, precip
│   │   ├── HourlyForecast.jsx  # Scrollable hourly strip
│   │   ├── WeatherChart.jsx    # SVG chart (temp/rain/wind/humidity)
│   │   ├── SevenDayForecast.jsx # 7-day grid
│   │   ├── SunTracker.jsx      # Animated sun arc
│   │   ├── WindCompass.jsx     # Compass rose + gust/beaufort
│   │   └── MoonPhase.jsx       # Moon phase + hourly rain bars
│   ├── data/
│   │   └── weatherData.js      # ← Replace with real API calls
│   ├── utils/
│   │   └── tempConvert.js      # °C ↔ °F helpers
│   ├── App.jsx                 # Root component
│   ├── index.css               # Tailwind + custom CSS animations
│   └── index.js                # React entry point
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🌐 Connecting a Real Weather API

All mock data lives in `src/data/weatherData.js`. To use live data:

### Option A — OpenWeatherMap (free tier)

```bash
# Get a free API key at https://openweathermap.org/api
```

Create `src/hooks/useWeather.js`:

```js
import { useState, useEffect } from "react";

const API_KEY = "YOUR_API_KEY_HERE";

export function useWeather(city = "Pune") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await window.fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    fetch();
  }, [city]);

  return { data, loading };
}
```

Then in `App.jsx`, replace the static import with:

```jsx
import { useWeather } from "./hooks/useWeather";

const { data, loading } = useWeather("Pune");
// Map `data` fields to the `currentWeather` shape used by components
```

### Option B — WeatherAPI.com

```
https://api.weatherapi.com/v1/forecast.json?key=YOUR_KEY&q=Pune&days=7&aqi=yes
```

Covers current, hourly, 7-day, AQI, UV all in one call.

---

## ✨ Features

| Feature | Details |
|---|---|
| °C / °F toggle | All temperatures convert instantly |
| Hourly forecast | Scrollable 13-hour strip |
| Multi-mode chart | Temperature, Rain, Wind, Humidity curves |
| 7-day forecast | High/low/precip per day |
| AQI panel | PM2.5, O₃, NO₂ breakdown |
| UV index | Color-coded scale bar |
| Sun tracker | Animated arc with golden hour |
| Wind compass | Rotating needle, gust, Beaufort scale |
| Moon phase | Illumination + moonrise/moonset |
| Weather alerts | Animated pulsing banner |
| Metric bars | Animated fill on load |
| Dark theme | Deep navy glassmorphism |

---

## 🎨 Tech Stack

- **React 18** — hooks-based components
- **Tailwind CSS 3** — utility styling
- **Custom CSS animations** — orbs, fade-stagger, compass needle
- **SVG charts** — hand-crafted bezier curve charts with tooltip
- **Google Fonts** — Space Grotesk + DM Mono

---

Made with ☁️ by Stratos
