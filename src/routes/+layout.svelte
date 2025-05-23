<script lang="ts">
    import "../app.css";
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let { children } = $props();
    let isAuthenticated = false;
    
    // Check authentication on client-side
    onMount(() => {
        if (browser) {
            const storedPassword = localStorage.getItem('password');
            isAuthenticated = !!storedPassword;
            
            // Redirect to login if not authenticated and not already on login page
            if (!isAuthenticated && $page.url.pathname !== '/login') {
                goto('/login');
            }
        }
    });

    // Add authentication header to all fetch requests
    if (browser) {
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            
            // Add auth header for all API requests including the cron routes
            if (url.includes('/api/')) {
                init = init || {};
                init.headers = init.headers || {};
                
                // Add the password as a header
                const password = localStorage.getItem('password');
                if (password) {
                    init.headers = {
                        ...init.headers,
                        'X-Password': password
                    };
                }
            }
            
            return originalFetch(input, init);
        };
    }
</script>

<svelte:head>
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>My Feed</title>
</svelte:head>

<div class="w-full">
    <div class="mx-auto w-full max-w-md">
        {@render children()}
    </div>
</div>
