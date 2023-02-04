const CACHE = {
  init: cacheName =>
  caches
  .open(cacheName)
  .then(cache => {
  CACHE.cacheRef = cache;
  return caches.keys();
  })
  .then(keys => {
  keys.forEach(key => {
  if (key !== cacheName) caches.delete(key);
  });
  return true;
  })
  .catch(err => console.warn(err.message)),
  
  saveFile: (request, response) => CACHE.cacheRef.put(request, response),
  
  getFiles: () => CACHE.cacheRef.keys().then(requests => requests),
  
  getResponse: filename => CACHE.cacheRef.match(filename),
  
  removeFile: filename => CACHE.cacheRef.delete(filename)
  };
  
  export default CACHE;