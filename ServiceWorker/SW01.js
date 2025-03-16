if ('serviceWorker' in navigator) {
    console.log('[Main Script] Service Worker supported');

    window.addEventListener('load', () => {
        console.log('[Main Script] Page fully loaded. Registering Service Worker...');
        navigator.serviceWorker.register('SW02.js')
            .then(registration => {
                console.log('Service worker registered:', registration);

                // Listen for controller change
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('[Main Script] Service Worker is now controlling the page');
                });

                // If the Service Worker is already controlling the page
                if (navigator.serviceWorker.controller) {
                    console.log('[Main Script] Service Worker is already controlling the page');
                }
            })
            .catch(error => {
                console.error('Service worker registration failed:', error);
            });
    });
} else {
    console.error('[Main Script] Service Worker not supported');
}