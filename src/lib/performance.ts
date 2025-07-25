// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
};

// Bundle analyzer helper
export const logBundleInfo = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    console.group('Bundle Performance Metrics');
    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
    console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart);
    console.log('First Paint:', performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint'));
    console.log('First Contentful Paint:', performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint'));
    console.groupEnd();
  }
};

// Critical resource preloader
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/placeholder.svg',
    // Add other critical resources here
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.svg') ? 'image' : 'script';
    document.head.appendChild(link);
  });
};

// Code splitting performance
export const trackCodeSplitting = (chunkName: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    console.log(`Code chunk "${chunkName}" loaded in ${end - start}ms`);
  };
};