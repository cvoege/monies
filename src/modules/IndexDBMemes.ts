// let fetchedStoreState = false;
// let savedStoreState = false;
// let currentStorageMedium: 'memory' | 'database' | 'localstorage' = 'memory';
// const openRequest = window.indexedDB.open('Monies', CURRENT_DATABASE_VERSION);

// let database: IDBDatabase | null = null;
// openRequest.onsuccess = () => {
//   database = openRequest.result;
//   currentStorageMedium = 'database';
// };
// openRequest.onerror = () => {
//   console.warn('Will not be able to save state with IndexedDB, falling back to localstorage.');
// };
// openRequest.onupgradeneeded = () => {
//   if (!database) return;
//   database.createObjectStore('incomes');
// };
