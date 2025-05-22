<script lang="ts">
    import { onMount } from "svelte";

    // Define types
    type FeedItem = {
        id: number;
        title: string;
        link: string;
        pub_date: string;
        type: string;
        source: string;
        date?: string;
        bookmarked: boolean;
        imageUrl?: string;
    };

    // Feed state
    let selectedFeed = "Articles";
    let feedItems: FeedItem[] = [];
    let loading = false;
    let hasMore = true;
    let offset = 0;
    let limit = 8;

    // Browser-only flag to prevent server-side fetch
    let isBrowser = false;

    // Load feed items on mount
    onMount(() => {
        // Set browser flag
        isBrowser = true;
        loadFeedItems();
    });

    // Load feed items from API
    async function loadFeedItems(loadMore = false) {
        // Skip if not in browser or already loading
        if (!isBrowser || loading) return;
        
        if (!loadMore) {
            offset = 0;
            feedItems = [];
        }

        loading = true;
        try {
            // For bookmarked view, use the bookmarks endpoint
            if (selectedFeed === "Bookmarked") {
                const response = await fetch(
                    `/api/bookmarks?limit=${limit}&offset=${offset}`,
                );
                const data = await response.json();

                if (data.success) {
                    // Format the items
                    const formattedItems = data.items.map((item: any) => ({
                        ...item,
                        date: new Date(item.pub_date).toLocaleDateString(),
                        bookmarked: true, // These are all bookmarked since they come from the bookmarks API
                    }));

                    // Append or replace items
                    feedItems = loadMore
                        ? [...feedItems, ...formattedItems]
                        : formattedItems;
                    hasMore = formattedItems.length === limit;
                    offset = loadMore ? offset + limit : limit;
                }
            } else {
                // Regular feed type filtering
                let typeParam = "";
                if (selectedFeed === "Articles") typeParam = "article";
                if (selectedFeed === "Videos") typeParam = "video";
                if (selectedFeed === "Pictures") typeParam = "picture";

                const typeQuery = `&type=${typeParam}`;

                const response = await fetch(
                    `/api/feed?limit=${limit}&offset=${offset}${typeQuery}`,
                );
                const data = await response.json();

                if (data.success) {
                    // Get items and check bookmark status for each
                    const items = data.items;
                    const bookmarkChecks = await Promise.all(
                        items.map(async (item: any) => {
                            try {
                                const res = await fetch(`/api/bookmarks/${item.id}`);
                                const data = await res.json();
                                return data.success ? data.bookmarked : false;
                            } catch (e) {
                                console.error("Error checking bookmark status:", e);
                                return false;
                            }
                        })
                    );
                    
                    // Format the items with bookmark status
                    const formattedItems = items.map((item: any, index: number) => ({
                        ...item,
                        date: new Date(item.pub_date).toLocaleDateString(),
                        bookmarked: bookmarkChecks[index],
                    }));

                    // Append or replace items
                    feedItems = loadMore
                        ? [...feedItems, ...formattedItems]
                        : formattedItems;
                    hasMore = formattedItems.length === limit;
                    offset = loadMore ? offset + limit : limit;
                } else {
                    console.error("Error loading feed:", data.error);
                }
            }
        } catch (error) {
            console.error("Error fetching feed:", error);
        } finally {
            loading = false;
        }
    }

    // Load more items when scrolling
    function loadMore() {
        if (!hasMore || loading) return;
        loadFeedItems(true);
    }

    // Watch for feed type changes
    $: {
        if (selectedFeed && isBrowser) {
            // Reset and load new items when feed type changes
            // Only execute if we're in the browser
            loadFeedItems();
        }
    }

    // Toggle bookmark status
    async function toggleBookmark(id: number) {
        // Get current item
        const item = feedItems.find(item => item.id === id);
        if (!item) return;
        
        try {
            const isCurrentlyBookmarked = item.bookmarked;
            
            // Call the appropriate API endpoint
            const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';
            const response = await fetch(`/api/bookmarks/${id}`, { method });
            const data = await response.json();
            
            if (data.success) {
                // Update the feedItems to reflect bookmark change
                feedItems = feedItems.map((item) => {
                    if (item.id === id) {
                        return { ...item, bookmarked: !isCurrentlyBookmarked };
                    }
                    return item;
                });
                
                // If we're in the bookmarked view and unbookmarked an item, remove it
                if (selectedFeed === "Bookmarked" && isCurrentlyBookmarked) {
                    feedItems = feedItems.filter(item => item.id !== id);
                }
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        }
    }

    // For bookmarked view, items are already filtered in loadFeedItems
    $: filteredItems = feedItems;
</script>

<div class="max-w-md mx-auto bg-white min-h-screen">
    <header
        class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10"
    >
        <div class="relative">
            <select
                bind:value={selectedFeed}
                class="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option>Articles</option>
                <option>Videos</option>
                <option>Pictures</option>
                <option>Bookmarked</option>
            </select>
            <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
            >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
            </div>
        </div>
    </header>

    <div class="feed">
        {#each filteredItems as item (item.id)}
            {#if item.type === "picture"}
                <div class="relative border-b border-gray-200">
                    <img
                        src={item.imageUrl ||
                            "https://via.placeholder.com/800x600?text=No+Image"}
                        alt="Feed image"
                        class="w-full h-64 object-cover"
                    />
                    <div class="absolute bottom-2 right-2">
                        <button
                            class="p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow"
                            on:click={() => toggleBookmark(Number(item.id))}
                        >
                            {#if item.bookmarked}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-indigo-600"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-gray-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                    />
                                </svg>
                            {/if}
                        </button>
                    </div>
                    <div
                        class="absolute bottom-2 left-2 text-xs bg-white/80 px-2 py-1 rounded text-gray-700"
                    >
                        {item.date}
                    </div>
                </div>
            {:else}
                <div
                    class="p-4 border-b border-gray-200 flex justify-between items-center"
                >
                    <div class="flex-1">
                        <h3 class="font-medium text-base">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 hover:underline">
                                {item.title}
                            </a>
                        </h3>
                        <div class="flex items-center mt-1">
                            {#if item.source === 'hackernews'}
                                <div class="h-5 w-5 bg-orange-500 flex items-center justify-center rounded mr-1">
                                    <span class="text-white text-xs font-bold">H</span>
                                </div>
                            {:else if item.source === 'r/factorio'}
                                <div class="h-5 w-5 bg-yellow-700 flex items-center justify-center rounded mr-1">
                                    <span class="text-white text-xs font-bold">F</span>
                                </div>
                            {:else}
                                <!-- Dynamic source initial -->
                                <div class="h-5 w-5 bg-gray-500 flex items-center justify-center rounded mr-1">
                                    <span class="text-white text-xs font-bold">{item.source ? item.source[0].toUpperCase() : '?'}</span>
                                </div>
                            {/if}
                            <p class="text-xs text-gray-500">
                                {item.date}
                            </p>
                        </div>
                    </div>

                    <button
                        class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        on:click={() => toggleBookmark(Number(item.id))}
                    >
                        {#if item.bookmarked}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-indigo-600"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                                />
                            </svg>
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                />
                            </svg>
                        {/if}
                    </button>
                </div>
            {/if}
        {/each}

        {#if loading}
            <div class="p-4 text-center">
                <div
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"
                ></div>
            </div>
        {:else if filteredItems.length === 0}
            <div class="p-8 text-center text-gray-500">
                <p>No items found</p>
            </div>
        {:else if hasMore}
            <div class="p-4 flex justify-center">
                <button
                    on:click={loadMore}
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Load More
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    /* iPhone 12 specific styles */
    :global(body) {
        background-color: #f3f4f6;
    }
</style>
