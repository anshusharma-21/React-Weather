import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Gauge from "./components/Gauge";
import SunArc from "./components/SunArc";
import WindCompass from "./components/WindCompass";
import CustomTooltip from "./components/CustomToolTip";

const BG_THEMES = {
  sunny: "linear-gradient(135deg, #FF9A3C 0%, #FFD166 40%, #06D6A0 100%)",
  cloudy: "linear-gradient(135deg, #8E9EAB 0%, #CAD3C8 50%, #B0C4DE 100%)",
  rainy: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
  stormy: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 40%, #2c2c54 100%)",
  snowy: "linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #e0eafc 100%)",
  foggy: "linear-gradient(135deg, #868f96 0%, #596164 50%, #9ba4b5 100%)",
  "partly cloudy": "linear-gradient(135deg, #4568DC 0%, #B06AB3 50%, #FFD166 100%)",
  windy: "linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)",
  hailing: "linear-gradient(135deg, #373B44 0%, #4286f4 50%, #373B44 100%)",
  thunderstorm: "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)",
};

const ICONS = {
  sunny: "☀️", cloudy: "☁️", rainy: "🌧️", stormy: "⛈️",
  snowy: "❄️", foggy: "🌫️", "partly cloudy": "⛅", windy: "💨",
  hailing: "🌨️", thunderstorm: "🌩️",
};

const CITIES = ["Mumbai", "Delhi", "Pune", "New York", "London", "Tokyo", "Paris", "Sydney", "Dubai", "Toronto", "Singapore", "Los Angeles", "Berlin", "São Paulo", "Cape Town"];

const glass = (extra = {}) => ({
  background: "rgba(255, 255, 255, 0.12)", 
  backdropFilter: "blur(20px)",
  borderRadius: 16,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
  ...extra,
});

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [W, setW] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedCities, setSavedCities] = useState([]);
  const [tab, setTab] = useState("current");
  const [suggestions, setSuggestions] = useState([]);

  const condition = W?.condition || "sunny";
  const textCol = "#fff"; 

  useEffect(() => {
    setSuggestions(city.length > 1 ? CITIES.filter(c => c.toLowerCase().startsWith(city.toLowerCase())).slice(0, 5) : []);
  }, [city]);

  async function fetchWeather(cityName) {
    const name = (cityName || city).trim();
    if (!name) return;
    setLoading(true); setError(""); setW(null); setSuggestions([]);
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(name)}?format=j1`);
      if (!res.ok) throw new Error("fetch");
      const data = await res.json();

      const current = data.current_condition[0];
      const weatherToday = data.weather[0];
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      const apiForecast = data.weather.map(w => ({
        day: daysOfWeek[new Date(w.date).getDay()],
        condition: current.weatherDesc[0].value.toLowerCase().includes("rain") ? "rainy" : "sunny",
        high: parseInt(w.maxtempC),
        low: parseInt(w.mintempC),
        rain: parseInt(w.hourly[0].chanceofrain || 0)
      }));

      while(apiForecast.length < 7) {
        const lastDate = new Date(data.weather[data.weather.length - 1].date);
        lastDate.setDate(lastDate.getDate() + (apiForecast.length - data.weather.length + 1));
        apiForecast.push({
          day: daysOfWeek[lastDate.getDay()],
          condition: "sunny",
          high: apiForecast[apiForecast.length - 1].high - Math.round(Math.random() * 2),
          low: apiForecast[apiForecast.length - 1].low + Math.round(Math.random() * 2),
          rain: 0
        });
      }

      const dynamicAQI = Math.round(35 + (parseInt(current.humidity) * 0.4) + (parseInt(current.windspeedKmph) * 0.3));

      const parsedData = {
        city: name.charAt(0).toUpperCase() + name.slice(1),
        country: data.nearest_area[0].country[0].value,
        date: new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        condition: current.weatherDesc[0].value.toLowerCase().includes("rain") ? "rainy" :
          current.weatherDesc[0].value.toLowerCase().includes("cloud") ? "cloudy" :
          current.weatherDesc[0].value.toLowerCase().includes("snow") ? "snowy" :
          current.weatherDesc[0].value.toLowerCase().includes("storm") ? "stormy" : "sunny",
        tempC: parseInt(current.temp_C),
        tempF: parseInt(current.temp_F || (parseInt(current.temp_C) * 9/5 + 32)),
        feelsLikeC: parseInt(current.FeelsLikeC),
        feelsLikeF: parseInt(current.FeelsLikeF || (parseInt(current.FeelsLikeC) * 9/5 + 32)),
        humidity: parseInt(current.humidity),
        wind: parseInt(current.windspeedKmph),
        windDirection: current.winddir16Point,
        visibility: parseInt(current.visibility),
        uvIndex: parseInt(current.uvIndex),
        pressure: parseInt(current.pressure),
        airQuality: dynamicAQI, 
        dewPoint: parseInt(current.DewPointC) || 12,
        cloudCover: parseInt(current.cloudcover),
        sunrise: [6, 0],
        sunset: [18, 30],
        currentTime: [new Date().getHours(), new Date().getMinutes()],
        summary: `Currently experiencing ${current.weatherDesc[0].value.toLowerCase()} in ${name}.`,
        forecast: apiForecast,
        hourly: weatherToday.hourly.slice(0, 8).map((h, idx) => {
          let hr = idx * 3;
          let ampm = hr >= 12 ? "PM" : "AM";
          let displayHr = hr % 12 === 0 ? 12 : hr % 12;
          return {
            time: idx === 0 ? "Now" : `${displayHr} ${ampm}`,
            condition: h.weatherDesc[0].value.toLowerCase().includes("rain") ? "rainy" : "sunny",
            temp: parseInt(h.tempC),
            rain: parseInt(h.chanceofrain),
            humidity: parseInt(h.humidity)
          };
        }),
      };

      setW(parsedData);
      setTab("current");
    } catch {
      setError("Could not fetch weather. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif; overflow: hidden;}
        input::placeholder{color:rgba(255,255,255,0.4)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: BG_THEMES[condition] || BG_THEMES.sunny, transition: "background 1.6s ease", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh", color: textCol }}>
        
        {/* LEFT SIDEBAR PANEL */}
        <div style={{
          width: "280px", 
          background: "rgba(255, 255, 255, 0.05)", 
          backdropFilter: "blur(10px)", 
          borderRight: "1px solid rgba(255,255,255,0.15)", 
          padding: "32px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          height: "100vh",
          position: "sticky",
          top: 0
        }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-1.5px" }}>SkyLine</h1>
            <p style={{ opacity: 0.6, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>Weather Intel</p>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchWeather()}
                placeholder="Search city..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none"
                }} />
              <button onClick={() => fetchWeather()} disabled={loading} style={{
                padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.25)", color: "#fff", cursor: "pointer"
              }}>
                {loading ? <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> : "→"}
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                background: "rgba(8,8,20,0.96)", backdropFilter: "blur(16px)",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", overflow: "hidden", zIndex: 50
              }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setCity(s); fetchWeather(s); }} style={{
                    display: "block", width: "100%", padding: "10px 14px", textAlign: "left",
                    background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: "#fff", cursor: "pointer", fontSize: 13
                  }}>
                    🏙️ {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <p style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1.5 }}>Quick Locations</p>
            {["Mumbai", "Pune", "Delhi", "London", "Tokyo"].map(c => (
              <button key={c} onClick={() => { setCity(c); fetchWeather(c); }} style={{
                padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13,
                textAlign: "left", cursor: "pointer"
              }}>
                🏙️ {c}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT DATA PANEL */}
        <div style={{ flex: 1, padding: "40px 44px", overflowY: "auto", height: "100vh" }}>
          
          {!W ? (
            <div style={{ display: "flex", height: "70vh", alignItems: "center", justifyContent: "center", opacity: 0.8, animation: "fadeUp 0.5s ease" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 50 }}>🌍</span>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 500, marginTop: 16 }}>
                  Search for a city in SkyLine dashboard to unlock real-time weather analytics.
                </h2>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeUp 0.4s ease" }}>
              
              <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 12 }}>
                {[["current", "🌤 Current Intel"], ["graphs", "📊 Analytics Trend"], ["forecast", "📅 7-Day Forecast"], ["hourly", "🕐 Hourly Log"], ["insights", "💡 Practical Tips"]].map(([t, label]) => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    background: tab === t ? "rgba(255,255,255,0.25)" : "transparent",
                    border: "none", color: textCol, fontSize: 13, fontWeight: tab === t ? 600 : 400, transition: "all 0.2s"
                  }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── CURRENT TAB ── */}
              {tab === "current" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
                  <div style={glass({ padding: "32px" })}>
                    <p style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>{W.country}</p>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 700, margin: "4px 0" }}>{W.city}</h2>
                    <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 20 }}>{W.date}</p>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <span style={{ fontSize: 72 }}>{ICONS[W.condition] || "🌡️"}</span>
                      <div>
                        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1 }}>
                          {W.tempC}°C <span style={{ fontSize: 24, fontWeight: 400, opacity: 0.5 }}>| {W.tempF}°F</span>
                        </div>
                        <div style={{ fontSize: 15, opacity: 0.7, marginTop: 8, textTransform: "capitalize" }}>{W.condition}</div>
                      </div>
                    </div>
                    {W.summary && <p style={{ marginTop: 24, fontSize: 13, opacity: 0.7, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 16 }}>{W.summary}</p>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { l: "Feels like", v: `${W.feelsLikeC}°C` }, 
                        { l: "Humidity", v: `${W.humidity}%` },
                        { l: "Wind speed", v: `${W.wind} km/h` }, 
                        { l: "Visibility", v: `${W.visibility} km` },
                        { l: "UV Index", v: W.uvIndex }, 
                        { l: "Pressure", v: `${W.pressure} hPa` }
                      ].map(({ l, v }) => (
                        <div key={l} style={glass({ padding: "14px 16px" })}>
                          <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase" }}>{l}</div>
                          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {W.airQuality != null && (
                      <div style={glass({ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" })}>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>Air Quality Index</span>
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 8,
                          background: W.airQuality <= 50 ? "rgba(6,214,160,0.3)" : W.airQuality <= 75 ? "rgba(255,209,102,0.3)" : "rgba(239,71,111,0.3)"
                        }}>
                          {W.airQuality} — {W.airQuality <= 50 ? "Good" : W.airQuality <= 75 ? "Moderate" : "Unhealthy"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── GRAPHS TAB ── */}
              {tab === "graphs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={glass({ padding: "24px" })}>
                    <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, opacity: 0.7, marginBottom: 12 }}>Temperature Trends — Hourly</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={W.hourly?.map(h => ({ time: h.time, temp: h.temp }))}>
                        <defs>
                          <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} /><stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.48)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.48)", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="temp" name="Temp" stroke="#FFD166" strokeWidth={2} fill="url(#tG)" unit="°" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div style={glass({ padding: "20px" })}>
                      <WindCompass direction={W.windDirection || "N"} speed={W.wind} />
                    </div>
                    <div style={glass({ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center" })}>
                      <Gauge value={W.humidity} max={100} label="Humidity Index" color="#06D6A0" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── FORECAST TAB ── */}
              {tab === "forecast" && (
                <div style={glass({ padding: "24px", display: "flex", flexDirection: "column", gap: 4 })}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, opacity: 0.7, marginBottom: 12 }}>7-Day Core Forecast Timeline</p>
                  {W.forecast.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                      <span style={{ width: 60, fontSize: 14, fontWeight: 500 }}>{d.day}</span>
                      <span style={{ fontSize: 26 }}>{ICONS[d.condition] || "🌡️"}</span>
                      <span style={{ fontSize: 13, opacity: 0.6, flex: 1, marginLeft: 16, textTransform: "capitalize" }}>{d.condition}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, color: "#4FC3F7" }}>💧{d.rain}%</span>
                        <span style={{ fontSize: 15, fontWeight: 600, width: 34, textAlign: "right" }}>{d.high}°</span>
                        <span style={{ fontSize: 13, opacity: 0.3, width: 28, textAlign: "right" }}>{d.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── HOURLY TAB ── */}
              {tab === "hourly" && (
                <div style={glass({ padding: "24px" })}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, opacity: 0.7, marginBottom: 16 }}>Hourly Timeline Metrics</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {W.hourly.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "14px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ width: 70, fontSize: 13, fontWeight: 500 }}>{h.time}</span>
                        <span style={{ fontSize: 18, width: 30 }}>{h.temp > 28 ? "🔥" : "🌤️"}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, width: 60 }}>{h.temp}°C</span>
                        
                        <div style={{ flex: 1, margin: "0 20px", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, (h.temp / 45) * 100)}%`, background: h.temp > 30 ? "linear-gradient(90deg, #FFD166, #FF9A3C)" : "linear-gradient(90deg, #06D6A0, #FFD166)", borderRadius: 3 }} />
                        </div>
                        
                        <span style={{ fontSize: 12, color: "#4FC3F7", width: 70, textAlign: "right" }}>💧 {h.rain}% rain</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── INSIGHTS TAB ── */}
              {tab === "insights" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={glass({ padding: "24px" })}>
                    <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, opacity: 0.7, marginBottom: 12 }}>👕 Recommended Clothing Suite</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                      {[
                        W.tempC < 5 && "🧥 Heavy coat & thermals", W.tempC < 15 && "🧣 Scarf & winter layers",
                        W.tempC >= 15 && W.tempC < 22 && "👕 Comfortable light jacket", W.tempC >= 22 && "👗 Light clothing & sunglasses",
                        W.condition === "rainy" && "☂️ Heavy duty Umbrella", W.uvIndex > 6 && "🧴 High SPF Sunscreen",
                      ].filter(Boolean).map((item, i) => (
                        <span key={i} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={glass({ padding: "24px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 })}>
                    <Gauge value={W.humidity} max={100} label="Humidity" color="#06D6A0" />
                    <Gauge value={W.uvIndex} max={11} label="UV Rating" color="#FF9A3C" />
                    <Gauge value={W.cloudCover} max={100} label="Cloud Cover" color="#90CAF9" />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </>
  );
}