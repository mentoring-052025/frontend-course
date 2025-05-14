import { openDB } from 'https://cdn.skypack.dev/idb';
import { renderData } from '/js/frontend.js';

// ---------- CACHE FETCH FUNCTION ----------
async function cacheApiData() {
  const db = await openDB('MyCacheDB', 1, {
    upgrade(db) {
      db.createObjectStore('api_cache');
    },
  });

  const lastLoad = localStorage.getItem('last_load_ts');
  const urlParams = new URLSearchParams(window.location.search);
  const groupFilter = urlParams.get('group'); // ← this is the group param

  if (lastLoad) {
    console.log('Using cached data from IndexedDB (last load: ' + lastLoad + ')');
    const cachedData = await db.get('api_cache', 'items');
    if (cachedData && cachedData.data) {
      console.log('Data cached to IndexedDB:');
        let filtered = cachedData.data;
        

      // filter by URL param
      if (groupFilter) {
        filtered = filtered.filter(item => item.group === groupFilter);
      } else {
        console.log('No group filter applied.');
        filtered = filtered.slice(0, 10); // show first 10 items if URL does not have group param
      }


      const limitedItems = filtered.slice(0, 100); // show first 100 items only for each group, added for performance testing, can be adjusted or add pagination
      renderData(limitedItems);
      return;
    } else {
      console.warn('No data in IndexedDB. Refetching...');
    }
  }

  try {
    const res = await fetch('http://localhost:8000/data');
    const json = await res.json();
    let loadData
    console.log('Fetched from API:', json);
    await db.put('api_cache', json, 'items');
    localStorage.setItem('last_load_ts', new Date().toISOString());
    loadData = json.data;
    renderData(loadData.slice(0, 10));
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

// Clear IndexedDB cache and localStorage timestamp on button click (Help on top Navba)
async function clearCache() {
  try {
    const db = await openDB('MyCacheDB', 1);
    await db.delete('api_cache', 'items');
    localStorage.removeItem('last_load_ts');
    console.log('Cache cleared');
    alert('Cache cleared!');
  } catch (err) {
    console.error('Error clearing cache:', err);
    alert('Failed to clear cache.');
  }
}

// ---------- INIT ON LOAD ----------
cacheApiData();

// Event listener for the "Clear Cache" button
document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clearCacheBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCache);
  }
});
