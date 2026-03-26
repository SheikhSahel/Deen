# React Hydration Error Analysis

## Summary
Found **12 major sources** of hydration errors across the codebase. Most issues stem from time-dependent operations, browser-only APIs, and localStorage access during render or initialization.

---

## Critical Issues by Component

### 1. ❌ ai-qna-widget.tsx
**Severity: HIGH**
**Location:** Lines 75, 145

**Issues:**
- **Random ID generation during render** (Line 75):
  ```typescript
  function makeId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  ```
  - `Date.now()` returns different values on server vs client
  - `Math.random()` produces different values server vs client
  - IDs are different for the same message on SSR vs client hydration

- **sessionStorage access without hydration check** (Lines 111-115, 119-123, 126-130):
  ```typescript
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // ...
    }
  }, []);
  ```
  - sessionStorage is accessed in useEffect but state is initialized without it
  - Initial state `useState([])` differs from hydrated state after sessionStorage load

**Fix Required:**
- Wrap sessionStorage operations with `typeof window !== 'undefined'`
- Generate IDs server-side using stable source (not Math.random())
- Use mounted flag pattern to skip rendering until hydrated

---

### 2. ❌ theme-toggle.tsx
**Severity: MEDIUM**
**Location:** Lines 8-15

**Issues:**
- **Incomplete hydration guard** (Lines 8-15):
  ```typescript
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = resolvedTheme === "dark";
  
  return (
    // ... renders before mounted is true but still conditional rendering
    {mounted ? (isDark ? <Sun /> : <Moon />) : <Moon />}
  );
  ```
  - Component renders different children on first SSR vs client hydration
  - Icon changes from Moon (default) to Sun/Moon based on theme resolution
  - next-themes doesn't sync theme state properly during hydration

**Fix Required:**
- Prevent rendering the dynamic part until after hydration complete
- Ensure server-rendered icon matches client's resolved theme
- Consider moving theme resolution to layout level

---

### 3. ❌ daily-dua.tsx
**Severity: HIGH**
**Location:** Lines 9-13, 20-23

**Issues:**
- **Date-dependent state initialization** (Line 9):
  ```typescript
  const [now, setNow] = useState(() => new Date());
  ```
  - Server creates Date with server time
  - Client creates Date with client time
  - Results in different Dua selection: `const dayIndex = now.getDate() % DUA_CATEGORIES.length;`

- **No hydration check for interval**:
  ```typescript
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
  }, []);
  ```
  - Timer doesn't exist on server
  - Client mismatch: initial content differs from post-hydration

**Fix Required:**
- Calculate dua index server-side and store/sync it
- Remove state dependency on `new Date()` if possible
- Add hydration guard for interval setup

---

### 4. ❌ daily-quote.tsx
**Severity: HIGH**
**Location:** Line 12, 30-41

**Issues:**
- **Date-function dependent state**:
  ```typescript
  const [quote, setQuote] = useState(() => getQuoteOfTheDay());
  
  function getQuoteOfTheDay(date: Date = new Date()) {
    const day = date.getDate();
    return DAILY_QUOTES[day % DAILY_QUOTES.length];
  }
  ```
  - Server and client have different dates
  - Different quotes selected on SSR vs client render
  
- **Complex midnight refresh logic** (Lines 30-41):
  ```typescript
  useEffect(() => {
    setQuote(getQuoteOfTheDay()); // Updates state immediately after hydration
    
    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      // ...
    };
  }, []);
  ```
  - Immediate state update in useEffect causes hydration mismatch
  - Time calculation differs between timezones

**Fix Required:**
- Sync quote selection between server and client using current date
- Delay state updates until after hydration complete
- Pass explicit date to useEffect to avoid timezone issues

---

### 5. ❌ ramadan-countdown.tsx
**Severity: HIGH**
**Location:** Lines 54-59, 63-68, 72-79

**Issues:**
- **Date-dependent state initialization**:
  ```typescript
  const [snapshot, setSnapshot] = useState<RamadanSnapshot>(() => 
    buildRamadanSnapshot({
      country: "BD",
      moonSightingOffset: 0, // Uses hardcoded defaults, not settings
    })
  );
  ```
  - Uses default settings instead of loaded settings
  - `buildRamadanSnapshot()` uses `new Date()` which differs server vs client

- **Conflicting useLayoutEffect and useEffect** (Lines 63-68 & 72-79):
  ```typescript
  useLayoutEffect(() => {
    setSnapshot(buildRamadanSnapshot(settings));
  }, [settings]);
  
  useEffect(() => {
    const compute = () => setSnapshot(buildRamadanSnapshot(settings));
    compute(); // Redundant call
    const timer = window.setInterval(compute, 60_000);
    return () => window.clearInterval(timer);
  }, [settings]);
  ```
  - useLayoutEffect forces synchronous updates during hydration
  - Multiple state updates cause hydration mismatch
  - Initial render differs from post-settings-load render

**Fix Required:**
- Initialize with correct default settings (not hardcoded)
- Remove redundant useLayoutEffect
- Move update logic to single effect
- Ensure date calculations happen after hydration

---

### 6. ❌ use-prayer-times.ts Hook
**Severity: MEDIUM**
**Location:** Line 42, 17, 26-28

**Issues:**
- **window.localStorage without typeof check** (Lines 26-28):
  ```typescript
  function readPrayerTimesCache(cacheKey: string): PrayerTimesResponse | null {
    if (typeof window === "undefined") return null;
    // Good pattern, but...
    
    try {
      const raw = window.localStorage.getItem(cacheKey);
  ```
  - Has proper check but...

- **Cache key depends on current date** (Line 17):
  ```typescript
  function getCacheKey(latitude: number, longitude: number) {
    const lat = latitude.toFixed(3);
    const lng = longitude.toFixed(3);
    const date = new Date().toISOString().slice(0, 10); // SERVER vs CLIENT DATE
    return `${PRAYER_TIMES_CACHE_KEY_PREFIX}:${date}:${lat}:${lng}`;
  }
  ```
  - Server generates cache key with server date
  - Client generates with client date (could differ by timezone or actual time difference)
  - Causes different cache hits/misses

**Fix Required:**
- Pass explicit date to getCacheKey instead of relying on `new Date()`
- Ensure server and client use same date reference
- Consider storing with UTC date to ensure consistency

---

### 7. ❌ use-geolocation.ts Hook
**Severity: HIGH**
**Location:** Lines 32, 64, 83

**Issues:**
- **Direct localStorage access without window check** (Line 32):
  ```typescript
  function readCachedGeolocation(): Coordinates | null {
    if (typeof window === "undefined") return null;
    // Has check, but state initialization doesn't
  ```

- **Initial state differs from hydrated state**:
  ```typescript
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true, // Server renders with "loading"
    error: null,
    isFallback: true,
  });
  ```
  - Server: renders "loading" state
  - Client: after geolocation call, renders with actual coordinates or error
  - Content mismatch during hydration

- **Browser-only API without proper hydration**:
  ```typescript
  const requestLocation = useCallback(() => {
    // ...
    if (!navigator.geolocation) { // Navigator doesn't exist on server
      // ...
    }
    navigator.geolocation.getCurrentPosition(
  ```
  - `navigator` is undefined on server
  - Client renders completely different content

**Fix Required:**
- Wrap all navigator calls in typeof window check
- Initialize state to match server render
- Delay geolocation requests to after hydration
- Show loading state that matches both server and client

---

### 8. ❌ use-islamic-settings.ts Hook
**Severity: MEDIUM**
**Location:** Line 18

**Issues:**
- **Direct localStorage access without window check**:
  ```typescript
  export function useIslamicSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULTS);
    
    useEffect(() => {
      try {
        const raw = localStorage.getItem(KEY); // No typeof window check
  ```
  - Server doesn't have localStorage, throws error or undefined behavior
  - State initialized with DEFAULTS on server
  - Client updates after useEffect runs

**Fix Required:**
- Add `if (typeof window === "undefined") return;` at top of useEffect
- Initialize state ensures server default matches client default
- Already using DEFAULTS is good, just need the guard

---

### 9. ❌ checklist-planner.tsx Component
**Severity: MEDIUM**
**Location:** Lines 22, 29

**Issues:**
- **Direct localStorage access without window check** (Lines 22-29):
  ```typescript
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey); // No typeof check
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) setChecked(parsed);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);
  ```
  - Same pattern in multiple hooks
  - Progress calculation differs: `const progress = useMemo(() => Math.round((checked.length / items.length) * 100), [checked.length, items.length]);`
  - Server: assumes no checked items (0%)
  - Client: after load, shows actual progress

**Fix Required:**
- Add window type check before localStorage access
- Ensure progress displays consistently

---

### 10. ❌ hero-section.tsx Component
**Severity: CRITICAL**
**Location:** Multiple (Lines 195-250)

**Issues:**
- **Multiple date-dependent operations in render path**:
  ```typescript
  const [clientTimeZone, setClientTimeZone] = useState(DHAKA_TIMEZONE);
  const [dates, setDates] = useState<HomeDates>(() => 
    getLocalHomeDates(new Date(), settings.moonSightingOffset)
  );
  ```
  - Line 195: Initial state uses DHAKA_TIMEZONE but client timezone is different
  - Line 197: useEffect sets actual client timezone asynchronously
  - Results in different date formatting: server (DHAKA_TIMEZONE) vs client (user's actual timezone)

- **Complex Intl.DateTimeFormat with timezone mismatch** (Lines 165-178, 227-239):
  ```typescript
  function getLocalHomeDates(now: Date, moonSightingOffset: number = 0): HomeDates {
    return {
      english: formatDateSafe(now, "en-GB", "en-US"),
      arabic: getHijriDateBn(now, DHAKA_TIMEZONE, moonSightingOffset), // Always DHAKA
      bengali: getBanglaBongabdoDate(now),
    };
  }
  
  // In effect:
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // Client's TZ
    if (tz) setClientTimeZone(tz); // Update after initial render
  }, []);
  ```

- **Midnight refresh with new Date()** (Lines 201-219):
  ```typescript
  useEffect(() => {
    setDates(getLocalHomeDates(new Date(), settings.moonSightingOffset));
    
    const scheduleMidnightRefresh = () => {
      const now = new Date(); // Different on server vs client
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      
      const delay = nextMidnight.getTime() - now.getTime();
      // Different delay on server vs client
      setTimeout(() => {
        const refreshedNow = new Date();
        setDates((prev) => ({
          ...prev,
          english: formatDateSafe(refreshedNow, "en-GB", "en-US"),
          arabic: getHijriDateBn(refreshedNow, DHAKA_TIMEZONE, settings.moonSightingOffset),
          bengali: getBanglaBongabdoDate(refreshedNow),
        }));
      }, delay);
    };
  }, [settings.moonSightingOffset]);
  ```
  - `new Date()` creates different times on server vs client
  - Delay calculation differs
  - Results in different refresh timing

- **API call with location-dependent Hijri date** (Lines 221-250):
  ```typescript
  useEffect(() => {
    const updateHijriFromLocation = async () => {
      const now = new Date();
      const targetCoordinates = coordinates ?? DEFAULT_COORDS;
      // ...
      const response = await fetch(
        `/api/prayer-times?latitude=${targetCoordinates.latitude}&longitude=${targetCoordinates.longitude}`,
      );
      // ...
      setDates((prev) => ({
        ...prev,
        arabic: clientTimeZone.startsWith("Asia/")
          ? getHijriDateBn(now, clientTimeZone, adjustmentDays)
          : hijriFromApi ?? getHijriDateBn(now, clientTimeZone, 0),
      }));
    };
  }, [coordinates, clientTimeZone, settings.moonSightingOffset]);
  ```
  - Server: uses DEFAULT_COORDS
  - Client: uses actual coordinates from geolocation
  - Causes different Hijri date calculations and API responses

**Fix Required:**
- Don't initialize state with `new Date()`, use static date
- Set timezone in initial state to match server value
- Only update dates after hydration is complete
- Ensure all date calculations use same reference point
- Move timezone detection to server or use consistent fallback

---

### 11. ❌ prayer-preview.tsx Component
**Severity: HIGH**
**Location:** Inherits issues from hooks

**Issues:**
- Depends on `useGeolocation()` which has hydration issues
- Depends on `usePrayerTimes()` which uses location-based cache
- Renders different content: loading state (server) → actual prayer times (client)
- Content completely changes after geolocation request completes

**Fix Required:**
- Fix underlying hooks
- Ensure loading state matches server render
- Consider SSR prayer times with default location

---

### 12. ⚠️ app/layout.tsx
**Severity: LOW** (but notable)
**Location:** Line 53

**Note:**
```typescript
<html lang="bn" suppressHydrationWarning>
```
- Suppresses hydration warnings but doesn't fix underlying issues
- Good that it's there, but masks real problems in child components

---

## Root Causes Summary

| Issue Type | Count | Components |
|------------|-------|------------|
| `new Date()` in state init | 4 | daily-dua, daily-quote, ramadan-countdown, hero-section |
| localStorage/sessionStorage without typeof check | 5 | ai-qna-widget, use-islamic-settings, checklist-planner, use-prayer-times, use-geolocation |
| Browser APIs without hydration guard | 3 | use-geolocation, theme-toggle, hero-section |
| useEffect immediate state update | 3 | daily-quote, theme-toggle, ramadan-countdown |
| Timezone/locale dependent rendering | 2 | hero-section, daily-quote |
| Random ID generation during render | 1 | ai-qna-widget |
| **Total Issues** | **18** | **Across 12 components** |

---

## Priority Fix Order

### 🔴 CRITICAL (Fix Immediately)
1. **hero-section.tsx** - Multiple date operations, timezone mismatches, API calls
2. **ai-qna-widget.tsx** - Random ID generation, sessionStorage
3. **daily-dua.tsx** - Date-dependent state init and per-minute updates

### 🟠 HIGH (Fix Soon)
4. **ramadan-countdown.tsx** - Conflicting effects, date calculations
5. **daily-quote.tsx** - Complex date logic and midnight refresh
6. **use-geolocation.ts** - Browser APIs without guards, localStorage

### 🟡 MEDIUM (Fix Next)
7. **theme-toggle.tsx** - Incomplete hydration pattern
8. **use-prayer-times.ts** - Timezone-dependent cache keys
9. **use-islamic-settings.ts** - Add window check
10. **checklist-planner.tsx** - Add window check

---

## Testing Recommendations

1. **Build and test SSR:**
   ```bash
   npm run build
   npm run start
   ```

2. **Check browser console for hydration warnings:**
   - Open DevTools before page loads
   - Look for "Hydration mismatch" errors
   - Check Component's rendered output differences

3. **Verify date consistency:**
   - Test on pages that cross midnight (UTC and local)
   - Verify Ramadan countdown and daily content on date boundaries
   - Check with different timezones

4. **Test localStorage/sessionStorage:**
   - Disable JavaScript to verify server rendering works
   - Check persistence across page reloads
   - Verify geolocation fallbacks

5. **Test with reduced motion:**
   - Some animations may be disabled server-side
   - Verify consistent rendering

---

## Reference Patterns

### ✅ Correct Pattern for Browser APIs
```typescript
// ✓ Good
useEffect(() => {
  if (typeof window === "undefined") return;
  const value = localStorage.getItem(key);
  // ...
}, []);

// ✓ Good - Client component with proper guard
if (typeof window !== "undefined") {
  useLocation();
}
```

### ✅ Correct Pattern for State with Hydration
```typescript
// ✓ Good - No dynamic values in initializer
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Only render hydration-sensitive content if mounted
{mounted && <DynamicContent />}
```

### ✅ Correct Pattern for Time Operations
```typescript
// ✓ Good - Pass date as prop from parent
function MyComponent({ currentDate }: { currentDate: Date }) {
  const dayIndex = currentDate.getDate();
  // Use stable dayIndex, not new Date()
}

// In parent (Server Component or passed from server)
export default function Parent() {
  const today = new Date();
  return <MyComponent currentDate={today} />;
}
```
