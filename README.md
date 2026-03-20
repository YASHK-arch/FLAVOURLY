# 🍽️ Flavorly — Recipe Discovery App

A beautiful, fast, and fully client-side recipe discovery app built with **React** + **Vite**, powered by the free [TheMealDB API](https://www.themealdb.com/api.php).

---

## 📸 What it Does

| Feature | Description |
|---|---|
| 🔍 **Ingredient / Title Search** | Search by meal name *or* ingredient — results are merged and deduplicated |
| ⚡ **Autocomplete** | Dropdown suggestions appear as you type, populated from the full API ingredient list |
| ❤️ **Favorites** | Save recipes across page refreshes using `localStorage` — zero backend needed |
| 🌿 **Vegetarian Filter** | One checkbox to filter only Vegetarian / Vegan meals |
| 📖 **Details Modal** | Click any card to see full ingredients list, cooking instructions, and a YouTube link |
| 🎭 **Meme Empty State** | A sliding "Zat" character appears when no recipes are found |

---

## 🗂️ Project Structure

```
FLAVOURLY/
├── index.html              ← Single HTML shell — Vite injects the JS here
├── vite.config.js          ← Vite configuration (React plugin, base path)
├── package.json            ← npm dependencies and scripts
└── src/
    ├── main.jsx            ← Entry point — mounts <App /> into #root
    ├── App.jsx             ← Root component — all state lives here
    ├── App.css             ← Global styles & CSS classes
    ├── index.css           ← Base CSS resets
    ├── assets/
    │   └── zat.png         ← Local meme image (Vite asset import)
    └── components/
        ├── Header.jsx           ← Navigation bar
        ├── Hero.jsx             ← Full-screen landing banner
        ├── RecipeList.jsx       ← Grid container + loading/error/empty states
        ├── RecipeCard.jsx       ← Individual recipe card
        └── RecipeDetailsModal.jsx ← Full-screen detail overlay
```

---

## ⚛️ React Concepts Used

### 1. Functional Components
Every file in `components/` (and `App.jsx`) is a **functional component** — a plain JavaScript function that returns JSX.

```jsx
const Hero = ({ onSeeMenu }) => {
  return <div className="hero-banner">...</div>;
};
```

No `class`, no `this`, no lifecycle methods — just functions and hooks.

---

### 2. JSX (JavaScript XML)
JSX looks like HTML but it is **JavaScript**. Vite/esbuild transforms it into `React.createElement()` calls.

Key rules:
- Use `className` instead of `class`
- Every tag must be closed (`<br/>`, `<img/>`)
- Embed JavaScript with `{}` — e.g. `{recipe.strMeal}`
- Components must return **one root element** (or a Fragment `<>`)

---

### 3. Props
Props are arguments passed from a parent component to a child.

```jsx
// Parent passes props:
<Header favoritesCount={5} showFavorites={false} setShowFavorites={setter} />

// Child receives and uses them:
const Header = ({ favoritesCount, showFavorites, setShowFavorites }) => { ... }
```

- **Value props** — current state values (`showFavorites`)
- **Callback props** — functions the child can call to notify the parent (`setShowFavorites`)

---

### 4. Lifting State Up
State is owned at the highest level where multiple children need it.

```
App.jsx (owns state)
├── Header.jsx (reads + changes showFavorites via prop)
├── Hero.jsx   (calls handleScrollToMenu via prop)
└── RecipeList.jsx → RecipeCard.jsx (reads + changes favorites via props)
```

Children never talk to each other directly — they go through the parent.

---

### 5. `useState` Hook
Declares a piece of **reactive state**. When the setter is called, React re-renders.

```jsx
const [searchQuery, setSearchQuery] = useState('chicken');
// searchQuery = current value
// setSearchQuery = function to update it
```

**Lazy initializer** — pass a function to compute the initial value once:
```jsx
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('flavorly_favorites');
  return saved ? JSON.parse(saved) : [];
});
```

**Functional update** — use when new state depends on old state:
```jsx
setFavorites(prev => [...prev, newRecipe]);
```

---

### 6. `useEffect` Hook
Runs **side effects** after React renders — things like API calls, timers, DOM mutations.

```jsx
useEffect(() => {
  // effect body — runs after render
  const timer = setTimeout(() => { ... }, 500);

  return () => {         // ← cleanup: runs before next effect or unmount
    clearTimeout(timer);
  };
}, [searchQuery]);       // ← dependency array: re-run when searchQuery changes
```

| Dependency Array | Behaviour |
|---|---|
| `[]` empty | Runs once on **mount**, cleanup runs on **unmount** |
| `[val]` | Re-runs whenever `val` changes |
| *(omitted)* | Re-runs after **every** render (usually a bug — avoid) |

---

### 7. `useRef` Hook
Gets a persistent reference to a **DOM element** without causing re-renders.

```jsx
const emptyRef = useRef(null);

// Attach to a DOM element:
<div ref={emptyRef}>...</div>

// After mount, read its position:
const rect = emptyRef.current.getBoundingClientRect();
window.scrollTo({ top: ..., behavior: 'smooth' });
```

Used in `RecipeList.jsx` to auto-scroll the empty-state panel into view.

---

### 8. Conditional Rendering
Three patterns used in this app:

```jsx
// Short-circuit (&&): renders right side only when left is truthy
{!showFavorites && <Hero onSeeMenu={handleScrollToMenu} />}

// Ternary: one of two options
{showFavorites ? "YOUR FAVORITES" : "THE MENU"}

// Early return: exit the component function early
if (loading) return <div className="loader" />;
```

---

### 9. List Rendering with `.map()`
Transforms an array into JSX. Every item needs a stable `key`.

```jsx
{recipes.map(recipe => (
  <RecipeCard
    key={recipe.idMeal}   // Unique, stable key from the API
    recipe={recipe}
    ...
  />
))}
```

The `key` prop lets React identify which items changed, so it only re-renders those cards instead of the whole list.

---

### 10. Controlled Inputs
React owns the value of the input — the DOM never decides on its own.

```jsx
<input
  value={searchQuery}                        // React → DOM
  onChange={(e) => setSearchQuery(e.target.value)}  // DOM → React
/>
```

The data flows in a **loop**: state → renders input value → user types → onChange updates state → re-render.

---

### 11. Event Handling
- `onClick`, `onChange`, `onFocus`, `onBlur` are React's synthetic event props.
- `e.preventDefault()` — stops default browser behaviour (e.g., following a link).
- `e.stopPropagation()` — prevents the click from bubbling up to parent elements.

---

### 12. Component Composition & Mounting/Unmounting
The modal is conditionally mounted:

```jsx
{selectedRecipe && <RecipeDetailsModal recipe={selectedRecipe} onClose={handleCloseModal} />}
```

When `selectedRecipe` becomes non-null → React **mounts** `RecipeDetailsModal` → its `useEffect` runs (locks body scroll).  
When `selectedRecipe` becomes null again → React **unmounts** it → cleanup runs (restores scroll).

---

## ⚡ Vite Concepts Used

### What is Vite?
Vite is a **build tool and dev server**. It:
- Serves files instantly using native ES modules (no slow bundling during development)
- Transforms `.jsx` files using esbuild (ultra-fast, no Babel needed)
- Handles asset imports (images → fingerprinted URLs)
- Bundles and optimises everything for production with `npm run build`

### Asset Imports
```jsx
import zatImg from '../assets/zat.png';
// zatImg is a URL string: e.g. "/assets/zat-abc123.png"
// Vite handles cache busting with the hash automatically
```

### CSS Imports in JS
```js
import './App.css';
// Vite injects these styles into a <style> tag at runtime
```

### `vite.config.js`
Configures the React plugin (for JSX transformation) and the `base` path (important for GitHub Pages deployment where the app isn't at `/`).

---

## 🌐 JavaScript / Web API Concepts

| Concept | Where Used |
|---|---|
| `async / await` | All API fetch functions in `App.jsx` |
| `Promise.all([...])` | Fire title + ingredient searches simultaneously |
| `localStorage.getItem/setItem` | Save and restore favorites |
| `JSON.parse / JSON.stringify` | Serialize the favorites array for storage |
| `Set` (unique collection) | Deduplicate meal IDs from two API sources |
| `Array.map()` | List rendering, transforming API data |
| `Array.filter()` | Vegetarian filter, deduplication, autocomplete |
| `Array.some()` | Check if a recipe is already in favorites |
| `Array.find()` | Locate a specific recipe by ID for the modal |
| Spread `[...arr, item]` | Immutably add item to favorites array |
| `setTimeout / clearTimeout` | Debounce and auto-scroll timing |
| Template literals `` `str${var}` `` | Dynamic key names, classNames, API URLs |
| Bracket notation `obj[key]` | Access `strIngredient1` … `strIngredient20` dynamically |
| `getBoundingClientRect()` | Measure DOM element position for scroll target |
| `window.scrollTo()` | Smooth programmatic scrolling |
| `document.body.style.overflow` | Lock/unlock page scroll when modal is open |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the development server (hot-reload enabled)
npm run dev

# Build for production
npm run build
```

---

## 🔗 API Reference

All data comes from [TheMealDB](https://www.themealdb.com/api.php) — a free, public recipe API.

| Endpoint | Purpose |
|---|---|
| `search.php?s={name}` | Search recipes by meal title |
| `filter.php?i={ingredient}` | Search recipes by ingredient |
| `lookup.php?i={id}` | Fetch full details for one meal |
| `list.php?i=list` | Get all ingredient names (for autocomplete) |

---

## 📝 License

This project is for learning and educational purposes. Recipe data © TheMealDB.
