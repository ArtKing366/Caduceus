import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Utensils,
  MapPin,
  Salad,
  ShoppingBasket,
  BookOpen,
  LogIn,
  LogOut,
  LocateFixed,
  Search,
  Plus,
  Camera,
  CheckSquare,
  Square,
  Store as StoreIcon,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PAGE_SIZE = 24;
const MAX_MAP_MARKERS = 150;

type Restaurant = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  address: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

type Dish = {
  id: number;
  code: string;
  restaurant_id: number;
  name: string;
  description: string | null;
  category: string | null;
  price_pln: number;
  serving_grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  dietary_tags: string[];
  allergens: string[];
};

type Meal = {
  id: number;
  name: string;
  meal_type: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  serving_grams: number;
  eaten_at: string;
};

type Recipe = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  instructions: string[];
  servings: number | null;
  prep_minutes: number | null;
  dietary_tags: string[];
};

type ShoppingList = {
  id: number;
  name?: string;
  title?: string;
};

type ShoppingItem = {
  id: number;
  name?: string;
  item_name?: string;
  custom_name?: string;
  product_name?: string;
  title?: string;
  quantity?: number | null;
  unit?: string | null;
  is_checked?: boolean;
  checked?: boolean;
};

type CatalogEntry = {
  key: string;
  productId?: number;
  storeCatalogItemId?: number;
  name: string;
  category: string;
  storeName: string;
  storeAddress: string;
  pricePln: number | null;
  packLabel: string;
  caloriesPer100: number | null;
  proteinPer100: number | null;
  fatPer100: number | null;
  carbsPer100: number | null;
  available: boolean;
};

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = new L.DivIcon({
  className: 'user-marker',
  html: '<span></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

function extractList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('caduceus_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [visibleRestaurantsCount, setVisibleRestaurantsCount] = useState(PAGE_SIZE);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [visibleDishesCount, setVisibleDishesCount] = useState(PAGE_SIZE);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loadingDishesForId, setLoadingDishesForId] = useState<number | null>(null);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [notice, setNotice] = useState('');
  const [position, setPosition] = useState<[number, number]>([51.759, 19.456]);
  const [hasLocation, setHasLocation] = useState(false);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealFat, setMealFat] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Shopping lists state
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [shoppingItemSchemaFields, setShoppingItemSchemaFields] = useState<string[]>([
    'name',
    'quantity',
    'unit',
  ]);

  // Products & store catalog state
  const [catalogEntries, setCatalogEntries] = useState<CatalogEntry[]>([]);
  const [catalogTotalHint, setCatalogTotalHint] = useState<number | null>(null);
  const [catalogMatchedTotal, setCatalogMatchedTotal] = useState<number>(0);
  const [catalogOffset, setCatalogOffset] = useState<number>(0);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [visibleProductsCount, setVisibleProductsCount] = useState(PAGE_SIZE);
  const [discoveredEndpoints, setDiscoveredEndpoints] = useState<{
    productsPath: string | null;
    storesPath: string | null;
    storeItemsPath: string | null;
  }>({ productsPath: null, storesPath: null, storeItemsPath: null });

  const [view, setView] = useState<'discover' | 'diary' | 'recipes' | 'shopping'>('discover');
  const dishesSectionRef = useRef<HTMLDivElement | null>(null);

  const headers = (isForm = false): Record<string, string> => ({
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  async function request(path: string, init: RequestInit = {}) {
    const isForm = init.body instanceof URLSearchParams || init.body instanceof FormData;
    const r = await fetch(API + path, {
      ...init,
      headers: { ...headers(isForm), ...(init.headers || {}) },
    });
    if (!r.ok) {
      if (r.status === 401 && token) {
        localStorage.removeItem('caduceus_token');
        setToken('');
        throw new Error('Session expired. Please sign in again.');
      }
      const d = await r.json().catch(() => ({}));
      const msg = Array.isArray(d.detail)
        ? d.detail.map((err: any) => `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`).join(', ')
        : d.detail;
      throw new Error(msg || `Request failed (${r.status})`);
    }
    if (r.status === 204) return null;
    return r.json();
  }

  async function auth() {
    try {
      if (authMode === 'register') {
        await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, full_name: fullName }),
        });
        setAuthMode('login');
        setNotice('Account created. Now log in.');
      } else {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const data = await request('/auth/login', {
          method: 'POST',
          body: formData,
        });
        localStorage.setItem('caduceus_token', data.access_token);
        setToken(data.access_token);
      }
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function loadRestaurants() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      const data = await request('/restaurants?' + params.toString());
      setRestaurants(extractList<Restaurant>(data));
      setVisibleRestaurantsCount(PAGE_SIZE);
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function loadDishes() {
    try {
      setSelectedRestaurant(null);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      const data = await request('/dishes?' + params.toString());
      setDishes(extractList<Dish>(data));
      setVisibleDishesCount(PAGE_SIZE);
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function handleViewRestaurantDishes(restaurant: Restaurant) {
    setLoadingDishesForId(restaurant.id);
    try {
      const data = await request(`/restaurants/${restaurant.id}/dishes`);
      setSelectedRestaurant(restaurant);
      setDishes(extractList<Dish>(data));
      setVisibleDishesCount(PAGE_SIZE);
      requestAnimationFrame(() => {
        dishesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (e) {
      setNotice(String(e));
    } finally {
      setLoadingDishesForId(null);
    }
  }

  async function loadDiary() {
    if (!token) return;
    try {
      const [m, s] = await Promise.all([request('/nutrition/meals'), request('/nutrition/summary')]);
      setMeals(extractList<Meal>(m));
      setSummary(s || { calories: 0, protein: 0, fat: 0, carbs: 0 });
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function loadRecipes() {
    try {
      const data = await request('/recipes');
      setRecipes(extractList<Recipe>(data));
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function inspectOpenApiAndLoadCatalog(
    searchTerm = productQuery,
    catFilter = productCategory,
    storeTerm = storeFilter,
    sortBy: 'default' | 'asc' | 'desc' = priceSort,
    nextOffset = 0,
    append = false
  ) {
    setLoadingCatalog(true);
    try {
      let { productsPath, storesPath, storeItemsPath } = discoveredEndpoints;

      if (!productsPath && !storesPath && !storeItemsPath) {
        const spec = await fetch(API + '/openapi.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (spec?.paths) {
          const paths = Object.keys(spec.paths);
          storeItemsPath =
            paths.find(
              (p) =>
                /store[-_]?catalog|catalog[-_]?items|store[-_]?items/i.test(p) &&
                !p.includes('{') &&
                spec.paths[p].get
            ) || null;
          productsPath =
            paths.find((p) => /^\/(api\/)?products\/?$/i.test(p) && spec.paths[p].get) ||
            paths.find((p) => /products/i.test(p) && !p.includes('{') && spec.paths[p].get) ||
            null;
          storesPath =
            paths.find((p) => /^\/(api\/)?stores\/?$/i.test(p) && spec.paths[p].get) ||
            paths.find((p) => /stores/i.test(p) && !p.includes('{') && spec.paths[p].get) ||
            null;

          const addItemOp = spec.paths['/shopping-lists/{list_id}/items']?.post;
          const schemaRef = addItemOp?.requestBody?.content?.['application/json']?.schema?.$ref;
          if (schemaRef && spec.components?.schemas) {
            const schemaName = schemaRef.split('/').pop();
            const props = spec.components.schemas[schemaName]?.properties;
            if (props) {
              setShoppingItemSchemaFields(Object.keys(props));
            }
          }

          setDiscoveredEndpoints({ productsPath, storesPath, storeItemsPath });
        }
      }

      const entries: CatalogEntry[] = [];
      const targetEndpoint = storeItemsPath || productsPath;

      if (targetEndpoint) {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set('q', searchTerm.trim());
        if (catFilter) params.set('category', catFilter);
        if (storeTerm.trim()) params.set('store', storeTerm.trim());
        if (sortBy !== 'default') {
          params.set('sort', sortBy === 'asc' ? 'price_asc' : 'price_desc');
        }
        params.set('offset', String(nextOffset));
        params.set('limit', '500');

        const raw = await request(`${targetEndpoint}?${params.toString()}`).catch(() =>
          request(targetEndpoint).catch(() => [])
        );

        if (raw && typeof raw.total === 'number') {
          setCatalogMatchedTotal(raw.total);
          if (!searchTerm.trim() && !catFilter && !storeTerm.trim()) {
            setCatalogTotalHint(raw.total);
          }
        }

        const rows = extractList<any>(raw);
        for (const row of rows) {
          const prod = row.product || row;
          const store = row.store || {};
          entries.push({
            key: `item-${row.id ?? prod.id ?? Math.random()}`,
            productId: prod.id ?? row.product_id,
            storeCatalogItemId: row.product_id ? row.id : undefined,
            name: prod.name || row.product_name || row.name || 'Unnamed product',
            category: prod.category || row.category || 'grocery',
            storeName: store.name || row.store_name || (row.price_pln ? 'Łódź Retail Store' : 'Catalog Product'),
            storeAddress: store.address || row.store_address || store.city || '',
            pricePln:
              typeof row.price_pln === 'number'
                ? row.price_pln
                : typeof prod.price_pln === 'number'
                ? prod.price_pln
                : null,
            packLabel:
              prod.pack_quantity && prod.pack_unit
                ? `${prod.pack_quantity} ${prod.pack_unit}`
                : prod.unit || '',
            caloriesPer100: prod.calories_per_100 ?? null,
            proteinPer100: prod.protein_per_100 ?? null,
            fatPer100: prod.fat_per_100 ?? null,
            carbsPer100: prod.carbs_per_100 ?? null,
            available: row.available !== false,
          });
        }
      }

      if (entries.length === 0 && !append && storesPath) {
        const storesRaw = await request(storesPath).catch(() => []);
        const storesList = extractList<any>(storesRaw);
        const matchingStores = storeTerm.trim()
          ? storesList.filter((s) =>
              `${s.name || ''} ${s.address || ''}`.toLowerCase().includes(storeTerm.trim().toLowerCase())
            )
          : storesList;

        for (const st of matchingStores.slice(0, 8)) {
          const stItemsRaw = await request(`/stores/${st.id}/items`)
            .catch(() => request(`/stores/${st.id}/catalog`))
            .catch(() => request(`/stores/${st.id}/products`))
            .catch(() => []);
          const stItems = extractList<any>(stItemsRaw);
          for (const row of stItems) {
            const prod = row.product || row;
            entries.push({
              key: `st-${st.id}-${row.id ?? prod.id ?? Math.random()}`,
              productId: prod.id ?? row.product_id,
              storeCatalogItemId: row.id,
              name: prod.name || row.product_name || row.name || 'Product',
              category: prod.category || row.category || 'grocery',
              storeName: st.name || `Store #${st.id}`,
              storeAddress: st.address || st.city || 'Łódź',
              pricePln: typeof row.price_pln === 'number' ? row.price_pln : null,
              packLabel: prod.pack_quantity && prod.pack_unit ? `${prod.pack_quantity} ${prod.pack_unit}` : '',
              caloriesPer100: prod.calories_per_100 ?? null,
              proteinPer100: prod.protein_per_100 ?? null,
              fatPer100: prod.fat_per_100 ?? null,
              carbsPer100: prod.carbs_per_100 ?? null,
              available: row.available !== false,
            });
          }
        }
        if (entries.length > 0) {
          setCatalogMatchedTotal(entries.length);
        }
      }

      setCatalogEntries((prev) => (append ? [...prev, ...entries] : entries));
      if (!append) {
        setVisibleProductsCount(PAGE_SIZE);
      }
    } catch (e) {
      setNotice(String(e));
    } finally {
      setLoadingCatalog(false);
    }
  }

  async function loadShoppingLists() {
    if (!token) return;
    try {
      const raw = await request('/shopping-lists');
      const lists = extractList<ShoppingList>(raw);
      setShoppingLists(lists);
      if (lists.length > 0) {
        const targetId = activeListId && lists.some((l) => l.id === activeListId) ? activeListId : lists[0].id;
        setActiveListId(targetId);
        await loadShoppingItems(targetId);
      } else {
        setActiveListId(null);
        setShoppingItems([]);
      }
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function loadShoppingItems(listId: number) {
    if (!token) return;
    try {
      const raw = await request(`/shopping-lists/${listId}/items`);
      setShoppingItems(extractList<ShoppingItem>(raw));
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function createShoppingList() {
    if (!token || !newListName.trim()) return;
    try {
      const created: ShoppingList = await request('/shopping-lists', {
        method: 'POST',
        body: JSON.stringify({ name: newListName.trim(), title: newListName.trim() }),
      });
      setNewListName('');
      await loadShoppingLists();
      if (created?.id) {
        setActiveListId(created.id);
        await loadShoppingItems(created.id);
      }
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function addShoppingItem(customName?: string, productId?: number, unitLabel = 'pcs') {
    const itemText = (customName ?? newItemName).trim();
    if (!token || !activeListId || !itemText) return;
    try {
      const payload: Record<string, any> = {
        quantity: Number(customName ? 1 : newItemQty || 1),
        unit: unitLabel || 'pcs',
      };
      if (shoppingItemSchemaFields.includes('custom_name')) payload.custom_name = itemText;
      if (shoppingItemSchemaFields.includes('item_name')) payload.item_name = itemText;
      if (shoppingItemSchemaFields.includes('name') || !shoppingItemSchemaFields.length) payload.name = itemText;
      if (productId && shoppingItemSchemaFields.includes('product_id')) payload.product_id = productId;

      await request(`/shopping-lists/${activeListId}/items`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!customName) {
        setNewItemName('');
        setNewItemQty('1');
      } else {
        setNotice(`Added "${itemText}" to shopping list.`);
      }
      await loadShoppingItems(activeListId);
    } catch (e) {
      setNotice(String(e));
    }
  }

  async function toggleShoppingItem(itemId: number) {
    if (!token || !activeListId) return;
    try {
      await request(`/shopping-lists/${activeListId}/items/${itemId}/check`, { method: 'PATCH' });
      await loadShoppingItems(activeListId);
    } catch (e) {
      setNotice(String(e));
    }
  }

  useEffect(() => {
    loadRestaurants();
    loadDishes();
    loadRecipes();
    inspectOpenApiAndLoadCatalog('', '', '', 'default', 0, false);
  }, []);

  useEffect(() => {
    if (token) {
      loadDiary();
      loadShoppingLists();
    }
  }, [token]);

  // Автоматический серверный поиск, фильтрация и сортировка с задержкой 350 мс
  useEffect(() => {
    if (view !== 'shopping') return;
    const timer = setTimeout(() => {
      setCatalogOffset(0);
      inspectOpenApiAndLoadCatalog(productQuery, productCategory, storeFilter, priceSort, 0, false);
    }, 350);
    return () => clearTimeout(timer);
  }, [view, productQuery, productCategory, storeFilter, priceSort]);

  function locate() {
    if (!navigator.geolocation) {
      setNotice('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPosition(pos);
        setHasLocation(true);
        try {
          const nearby = await request(`/restaurants/nearby?latitude=${pos[0]}&longitude=${pos[1]}&radius_km=10`);
          setRestaurants(extractList<Restaurant>(nearby));
          setVisibleRestaurantsCount(PAGE_SIZE);
        } catch (e) {
          setNotice(String(e));
        }
      },
      (e) => setNotice(e.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function addMeal() {
    try {
      await request('/nutrition/meals', {
        method: 'POST',
        body: JSON.stringify({
          name: mealName,
          calories: Number(mealCalories || 0),
          protein: Number(mealProtein || 0),
          fat: Number(mealFat || 0),
          carbs: Number(mealCarbs || 0),
          meal_type: 'other',
        }),
      });
      setMealName('');
      setMealCalories('');
      setMealProtein('');
      setMealFat('');
      setMealCarbs('');
      await loadDiary();
    } catch (e) {
      setNotice(String(e));
    }
  }

  function logout() {
    localStorage.removeItem('caduceus_token');
    setToken('');
    setMeals([]);
    setShoppingLists([]);
    setShoppingItems([]);
    setActiveListId(null);
  }

  const displayedRestaurants = restaurants.slice(0, visibleRestaurantsCount);
  const mapRestaurants = restaurants
    .filter((r) => r.latitude !== null && r.longitude !== null)
    .slice(0, MAX_MAP_MARKERS);
  const displayedDishes = dishes.slice(0, visibleDishesCount);
  const displayedProducts = catalogEntries.slice(0, visibleProductsCount);

  const sidebarStatusText = useMemo(() => {
    if (view === 'discover') {
      return restaurants.length > 0
        ? `Explore: ${restaurants.length} venues · ${dishes.length} dishes`
        : 'Explore: catalog empty';
    }
    if (view === 'diary') {
      return token
        ? `Diary: ${meals.length} meals · ${Math.round(summary.calories)} kcal`
        : 'Diary: sign in to track meals';
    }
    if (view === 'recipes') {
      return `Recipes: ${recipes.length} recipes in DB`;
    }
    const itemsCount = catalogTotalHint ?? catalogMatchedTotal ?? catalogEntries.length;
    return `Shopping: ${shoppingLists.length} lists · ${itemsCount.toLocaleString()} catalog items`;
  }, [
    view,
    restaurants.length,
    dishes.length,
    token,
    meals.length,
    summary.calories,
    recipes.length,
    shoppingLists.length,
    catalogTotalHint,
    catalogMatchedTotal,
    catalogEntries.length,
  ]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <b>Caduceus</b>
            <small>Nutrition companion</small>
          </div>
        </div>
        <nav>
          <button className={view === 'discover' ? 'active' : ''} onClick={() => setView('discover')}>
            <MapPin size={18} /> Explore
          </button>
          <button className={view === 'diary' ? 'active' : ''} onClick={() => setView('diary')}>
            <Salad size={18} /> Food diary
          </button>
          <button
            className={view === 'recipes' ? 'active' : ''}
            onClick={() => {
              setView('recipes');
              loadRecipes();
            }}
          >
            <BookOpen size={18} /> Recipes
          </button>
          <button
            className={view === 'shopping' ? 'active' : ''}
            onClick={() => {
              setView('shopping');
              if (token) loadShoppingLists();
            }}
          >
            <ShoppingBasket size={18} /> Shopping lists
          </button>
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" /> {sidebarStatusText}
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="eyebrow">YOUR PERSONAL NUTRITION SPACE</p>
            <h1>
              {view === 'discover'
                ? 'Explore your area'
                : view === 'diary'
                ? 'Your food diary'
                : view === 'recipes'
                ? 'Recipes'
                : 'Shopping lists & store catalog'}
            </h1>
          </div>
          <div className="header-actions">
            {token ? (
              <button className="secondary" onClick={logout}>
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <span className="login-hint">
                <LogIn size={16} /> Sign in to save data
              </span>
            )}
          </div>
        </header>

        {notice && (
          <div className="notice" onClick={() => setNotice('')}>
            {notice} <span>×</span>
          </div>
        )}

        {!token && (
          <section className="auth-card">
            <div>
              <b>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</b>
              <p>Sign in to save preferences, meals and lists.</p>
            </div>
            <div className="auth-fields">
              <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input
                placeholder="Password (8+ characters)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authMode === 'register' && (
                <input
                  placeholder="Full name (optional)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}
              <button className="primary" onClick={auth}>
                {authMode === 'register' ? 'Create account' : 'Sign in'}
              </button>
              <button
                className="text-button"
                onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
              >
                {authMode === 'register' ? 'Already registered? Sign in' : 'New here? Create account'}
              </button>
            </div>
          </section>
        )}

        {view === 'discover' && (
          <>
            <section className="search-panel">
              <div className="search-input">
                <Search size={18} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadRestaurants();
                      loadDishes();
                    }
                  }}
                  placeholder="Search restaurants or dishes"
                />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All categories</option>
                <option value="healthy">Healthy</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="polish">Polish</option>
                <option value="asian">Asian</option>
                <option value="italian">Italian</option>
              </select>
              <button
                className="primary"
                onClick={() => {
                  loadRestaurants();
                  loadDishes();
                }}
              >
                Search
              </button>
              <button className="secondary" onClick={locate}>
                <LocateFixed size={16} /> Near me
              </button>
            </section>

            <section className="map-card">
              <div className="map-title">
                <div>
                  <b>Restaurants around you</b>
                  <p>
                    {hasLocation ? 'Using your current location' : 'Map centered on Łódź'} · showing{' '}
                    {mapRestaurants.length} of {restaurants.length} pins
                  </p>
                </div>
                <span className="pill">
                  <span className="status-dot" /> Interactive map
                </span>
              </div>
              <MapContainer center={position} zoom={12} scrollWheelZoom className="map">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Recenter center={position} />
                {hasLocation && (
                  <Marker position={position} icon={userIcon}>
                    <Popup>Your current location</Popup>
                  </Marker>
                )}
                {mapRestaurants.map((r) => (
                  <Marker key={r.id} position={[r.latitude!, r.longitude!]} icon={icon}>
                    <Popup>
                      <b>{r.name}</b>
                      <br />
                      {r.category || 'Restaurant'}
                      <br />
                      {r.address || r.city}
                      <br />
                      <button
                        className="text-button"
                        style={{ marginTop: 6 }}
                        onClick={() => handleViewRestaurantDishes(r)}
                      >
                        View dishes →
                      </button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </section>

            <div className="section-heading">
              <div>
                <h2>Restaurants</h2>
                <p>
                  Showing {displayedRestaurants.length} of {restaurants.length} in catalog
                </p>
              </div>
              <button className="text-button" onClick={loadRestaurants}>
                Refresh
              </button>
            </div>

            {restaurants.length === 0 ? (
              <div className="empty">
                <Utensils size={26} />
                <h3>No restaurants in the catalog yet</h3>
                <p>Import your own JSON catalog using the API docs. No bulk dataset is included.</p>
                <a href={`${API}/docs`} target="_blank" rel="noreferrer">
                  Open API documentation ↗
                </a>
              </div>
            ) : (
              <>
                <div className="cards">
                  {displayedRestaurants.map((r) => (
                    <article className="restaurant-card" key={r.id}>
                      <div className="restaurant-visual">
                        <Utensils size={28} />
                        <span>{r.category || 'Restaurant'}</span>
                      </div>
                      <div className="restaurant-body">
                        <h3>{r.name}</h3>
                        <p>{r.address || r.city}</p>
                        <small>{r.description || 'Catalog listing'}</small>
                        <button
                          className="text-button"
                          disabled={loadingDishesForId === r.id}
                          onClick={() => handleViewRestaurantDishes(r)}
                        >
                          {loadingDishesForId === r.id ? 'Loading menu...' : 'View dishes →'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {visibleRestaurantsCount < restaurants.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <button
                      className="secondary"
                      onClick={() => setVisibleRestaurantsCount((prev) => prev + PAGE_SIZE)}
                    >
                      Show more restaurants ({restaurants.length - visibleRestaurantsCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}

            <div ref={dishesSectionRef} className="section-heading">
              <div>
                <h2>{selectedRestaurant ? `Menu: ${selectedRestaurant.name}` : 'Dishes'}</h2>
                <p>
                  {selectedRestaurant
                    ? `${dishes.length} dishes available at ${selectedRestaurant.name}`
                    : `Showing ${displayedDishes.length} of ${dishes.length} dishes`}
                </p>
              </div>
              {selectedRestaurant && (
                <button className="secondary" onClick={loadDishes}>
                  Show all dishes
                </button>
              )}
            </div>

            {dishes.length === 0 ? (
              <div className="empty compact">
                <Utensils size={22} />
                <p>No dishes found for this selection.</p>
              </div>
            ) : (
              <>
                <div className="dish-grid">
                  {displayedDishes.map((d) => (
                    <article className="dish-card" key={d.id}>
                      <div className="dish-top">
                        <span>{d.category || 'Dish'}</span>
                        <b>{d.price_pln.toFixed(2)} zł</b>
                      </div>
                      <h3>{d.name}</h3>
                      <p>{d.description || 'Menu item'}</p>
                      <div className="macros">
                        <span>{d.calories} kcal</span>
                        <span>P {d.protein}g</span>
                        <span>F {d.fat}g</span>
                        <span>C {d.carbs}g</span>
                      </div>
                    </article>
                  ))}
                </div>
                {visibleDishesCount < dishes.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <button
                      className="secondary"
                      onClick={() => setVisibleDishesCount((prev) => prev + PAGE_SIZE)}
                    >
                      Show more dishes ({dishes.length - visibleDishesCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {view === 'diary' && (
          <>
            <div className="stats">
              {[
                ['Calories', summary.calories + ' kcal'],
                ['Protein', summary.protein + ' g'],
                ['Fat', summary.fat + ' g'],
                ['Carbs', summary.carbs + ' g'],
              ].map(([k, v]) => (
                <div className="stat" key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <section className="panel">
              <h2>
                <Plus size={18} /> Add meal manually
              </h2>
              <div className="meal-form">
                <input placeholder="Meal name" value={mealName} onChange={(e) => setMealName(e.target.value)} />
                <input
                  placeholder="kcal"
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                />
                <input
                  placeholder="Protein g"
                  type="number"
                  value={mealProtein}
                  onChange={(e) => setMealProtein(e.target.value)}
                />
                <input placeholder="Fat g" type="number" value={mealFat} onChange={(e) => setMealFat(e.target.value)} />
                <input
                  placeholder="Carbs g"
                  type="number"
                  value={mealCarbs}
                  onChange={(e) => setMealCarbs(e.target.value)}
                />
                <button className="primary" onClick={addMeal} disabled={!token || !mealName.trim()}>
                  Add entry
                </button>
              </div>
              {!token && <p className="muted">Sign in to save food diary entries.</p>}
            </section>
            <div className="section-heading">
              <div>
                <h2>Today's meals</h2>
                <p>Entries saved to your account</p>
              </div>
              <button className="secondary" onClick={loadDiary}>
                Refresh
              </button>
            </div>
            {meals.length === 0 ? (
              <div className="empty compact">
                <Salad size={24} />
                <p>No meals logged today.</p>
              </div>
            ) : (
              <div className="meal-list">
                {meals.map((m) => (
                  <div className="meal-row" key={m.id}>
                    <div>
                      <b>{m.name}</b>
                      <small>{new Date(m.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                    <strong>{m.calories} kcal</strong>
                    <span>
                      P {m.protein}g · F {m.fat}g · C {m.carbs}g
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'recipes' && (
          <>
            <div className="section-heading">
              <div>
                <h2>Recipes</h2>
                <p>{recipes.length} recipes in catalog</p>
              </div>
              <button className="secondary" onClick={loadRecipes}>
                Refresh
              </button>
            </div>
            {recipes.length === 0 ? (
              <div className="empty">
                <BookOpen size={26} />
                <h3>No recipes in catalog yet</h3>
                <p>Import recipe records through JSON using the API docs.</p>
                <a href={`${API}/docs`} target="_blank" rel="noreferrer">
                  Open API documentation ↗
                </a>
              </div>
            ) : (
              <div className="dish-grid">
                {recipes.map((rec) => (
                  <article className="dish-card" key={rec.id}>
                    <div className="dish-top">
                      <span>{rec.prep_minutes ? `${rec.prep_minutes} min` : 'Recipe'}</span>
                      <b>{rec.servings ? `${rec.servings} servings` : ''}</b>
                    </div>
                    <h3>{rec.name}</h3>
                    <p>{rec.description || 'Healthy homemade meal'}</p>
                    {rec.instructions?.length > 0 && (
                      <ol style={{ paddingLeft: 18, marginTop: 8, fontSize: 13 }}>
                        {rec.instructions.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'shopping' && (
          <>
            {!token ? (
              <div className="empty">
                <ShoppingBasket size={26} />
                <h3>Sign in to manage shopping lists</h3>
                <p>Shopping lists are private to your account.</p>
              </div>
            ) : (
              <>
                <section className="panel">
                  <h2>
                    <Plus size={18} /> Create shopping list
                  </h2>
                  <div className="meal-form">
                    <input
                      placeholder="List name (e.g. Biedronka weekly)"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                    <button className="primary" onClick={createShoppingList} disabled={!newListName.trim()}>
                      Create list
                    </button>
                  </div>
                  {shoppingLists.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {shoppingLists.map((lst) => (
                        <button
                          key={lst.id}
                          className={lst.id === activeListId ? 'primary' : 'secondary'}
                          onClick={() => {
                            setActiveListId(lst.id);
                            loadShoppingItems(lst.id);
                          }}
                        >
                          {lst.name || lst.title || `List #${lst.id}`}
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {activeListId && (
                  <>
                    <section className="panel">
                      <h2>
                        <Plus size={18} /> Add custom item to list
                      </h2>
                      <div className="meal-form">
                        <input
                          placeholder="Product name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addShoppingItem();
                          }}
                        />
                        <input
                          placeholder="Qty"
                          type="number"
                          value={newItemQty}
                          onChange={(e) => setNewItemQty(e.target.value)}
                        />
                        <button className="primary" onClick={() => addShoppingItem()} disabled={!newItemName.trim()}>
                          Add item
                        </button>
                      </div>
                    </section>

                    <div className="meal-list">
                      {shoppingItems.length === 0 ? (
                        <div className="empty compact">
                          <ShoppingBasket size={22} />
                          <p>This shopping list is empty.</p>
                        </div>
                      ) : (
                        shoppingItems.map((item) => {
                          const checked = Boolean(item.is_checked ?? item.checked);
                          const label =
                            item.name ||
                            item.item_name ||
                            item.custom_name ||
                            item.product_name ||
                            item.title ||
                            `Item #${item.id}`;
                          return (
                            <div
                              className="meal-row"
                              key={item.id}
                              style={{ cursor: 'pointer', opacity: checked ? 0.6 : 1 }}
                              onClick={() => toggleShoppingItem(item.id)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {checked ? <CheckSquare size={18} /> : <Square size={18} />}
                                <b style={{ textDecoration: checked ? 'line-through' : 'none' }}>{label}</b>
                              </div>
                              <span>
                                {item.quantity ?? 1} {item.unit || 'pcs'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <div className="section-heading" style={{ marginTop: 28 }}>
              <div>
                <h2>Store Products & Prices Catalog</h2>
                <p>
                  Showing {displayedProducts.length} of {catalogEntries.length} loaded
                  {catalogMatchedTotal > 0 ? ` (${catalogMatchedTotal.toLocaleString()} matched in DB)` : ''}
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  setCatalogOffset(0);
                  inspectOpenApiAndLoadCatalog(productQuery, productCategory, storeFilter, priceSort, 0, false);
                }}
              >
                {loadingCatalog ? 'Loading...' : 'Refresh DB'}
              </button>
            </div>

            <section className="search-panel">
              <div className="search-input">
                <Search size={18} />
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCatalogOffset(0);
                      inspectOpenApiAndLoadCatalog(productQuery, productCategory, storeFilter, priceSort, 0, false);
                    }
                  }}
                  placeholder="Filter products (e.g. chleb, mleko, platki, kurczak...)"
                />
              </div>
              <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                <option value="">All categories</option>
                <option value="dairy">Dairy (Nabiał)</option>
                <option value="bakery">Bakery (Pieczywo)</option>
                <option value="grains">Grains & Pasta</option>
                <option value="meat">Meat (Mięso)</option>
                <option value="produce">Produce (Warzywa/Owoce)</option>
                <option value="beverages">Beverages (Napoje)</option>
                <option value="snacks">Snacks (Przekąski)</option>
                <option value="breakfast">Breakfast (Śniadaniowe)</option>
              </select>
              <input
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d7ded9', minWidth: 160 }}
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                placeholder="Store (Biedronka, Lidl...)"
              />
              <select value={priceSort} onChange={(e) => setPriceSort(e.target.value as 'default' | 'asc' | 'desc')}>
                <option value="default">Sort: Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
              <button
                className="primary"
                onClick={() => {
                  setCatalogOffset(0);
                  inspectOpenApiAndLoadCatalog(productQuery, productCategory, storeFilter, priceSort, 0, false);
                }}
              >
                Filter
              </button>
            </section>

            {catalogEntries.length === 0 ? (
              <div className="empty compact">
                <StoreIcon size={22} />
                <p>
                  {loadingCatalog
                    ? 'Loading products from database...'
                    : 'No products matched your filter. Try another query or clear filters.'}
                </p>
              </div>
            ) : (
              <>
                <div className="dish-grid">
                  {displayedProducts.map((item) => (
                    <article className="dish-card" key={item.key}>
                      <div className="dish-top">
                        <span>{item.category}</span>
                        <b>{item.pricePln !== null ? `${item.pricePln.toFixed(2)} zł` : item.packLabel}</b>
                      </div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.storeName}
                        {item.storeAddress ? ` · ${item.storeAddress}` : ''}
                        {item.packLabel ? ` (${item.packLabel})` : ''}
                      </p>
                      {item.caloriesPer100 !== null && (
                        <div className="macros">
                          <span>{item.caloriesPer100} kcal/100g</span>
                          <span>P {item.proteinPer100 ?? 0}g</span>
                          <span>F {item.fatPer100 ?? 0}g</span>
                          <span>C {item.carbsPer100 ?? 0}g</span>
                        </div>
                      )}
                      {token && activeListId && (
                        <button
                          className="text-button"
                          style={{ marginTop: 10 }}
                          onClick={() => addShoppingItem(item.name, item.productId, 'pcs')}
                        >
                          + Add to active list
                        </button>
                      )}
                    </article>
                  ))}
                </div>

                {visibleProductsCount < catalogEntries.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <button
                      className="secondary"
                      onClick={() => setVisibleProductsCount((prev) => prev + PAGE_SIZE)}
                    >
                      Show 24 more ({catalogEntries.length - visibleProductsCount} loaded remaining)
                    </button>
                  </div>
                )}

                {visibleProductsCount >= catalogEntries.length && catalogEntries.length < catalogMatchedTotal && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 24px' }}>
                    <button
                      className="primary"
                      disabled={loadingCatalog}
                      onClick={() => {
                        const nextOffset = catalogOffset + 500;
                        setCatalogOffset(nextOffset);
                        inspectOpenApiAndLoadCatalog(
                          productQuery,
                          productCategory,
                          storeFilter,
                          priceSort,
                          nextOffset,
                          true
                        );
                      }}
                    >
                      {loadingCatalog
                        ? 'Loading next 500 from DB...'
                        : `Load next 500 from DB (${catalogEntries.length.toLocaleString()} of ${catalogMatchedTotal.toLocaleString()} loaded)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <footer>
          <span>CADUCEUS · EDUCATIONAL PROTOTYPE</span>
          <span>
            <Camera size={14} /> Photo scanning is planned in the mobile app
          </span>
        </footer>
      </main>
    </div>
  );
}
