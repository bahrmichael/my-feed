<script lang="ts">
  import { onMount } from 'svelte';

  // Feed state
  let selectedFeed = 'Articles';
  let feedItems = [
    { id: 1, title: 'Getting Started with Svelte 5', type: 'article', date: 'May 20, 2025', bookmarked: false },
    { id: 2, title: 'Building Reactive Mobile Apps', type: 'article', date: 'May 19, 2025', bookmarked: true },
    { id: 3, title: 'Advanced Tailwind CSS Techniques', type: 'video', date: 'May 18, 2025', bookmarked: false },
    { id: 4, title: 'The Future of Web Development', type: 'article', date: 'May 17, 2025', bookmarked: false },
    { id: 5, title: 'Creating Custom Animations', type: 'video', date: 'May 16, 2025', bookmarked: true },
    { id: 6, type: 'picture', date: 'May 15, 2025', bookmarked: false, imageUrl: 'https://source.unsplash.com/random/800x600?nature' },
    { id: 7, type: 'picture', date: 'May 14, 2025', bookmarked: true, imageUrl: 'https://source.unsplash.com/random/800x600?city' },
    { id: 8, type: 'picture', date: 'May 13, 2025', bookmarked: false, imageUrl: 'https://source.unsplash.com/random/800x600?people' },
  ];

  // Filtered items based on selection
  $: filteredItems = feedItems.filter(item => {
    if (selectedFeed === 'Articles') return item.type === 'article';
    if (selectedFeed === 'Videos') return item.type === 'video';
    if (selectedFeed === 'Pictures') return item.type === 'picture';
    if (selectedFeed === 'Bookmarked') return item.bookmarked;
    return true;
  });

  // Dummy API call function
  async function toggleBookmark(id: number) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update local state
    feedItems = feedItems.map(item => {
      if (item.id === id) {
        return { ...item, bookmarked: !item.bookmarked };
      }
      return item;
    });
  }
</script>

<div class="max-w-md mx-auto bg-white min-h-screen">
  <header class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
    <div class="relative">
      <select 
        bind:value={selectedFeed}
        class="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <option>Articles</option>
        <option>Videos</option>
        <option>Pictures</option>
        <option>Bookmarked</option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </div>
    </div>
  </header>

  <div class="feed">
    {#each filteredItems as item (item.id)}
      {#if item.type === 'picture'}
        <div class="relative border-b border-gray-200">
          <img 
            src={item.imageUrl} 
            alt="Feed image" 
            class="w-full h-64 object-cover"
          />
          <div class="absolute bottom-2 right-2">
            <button 
              class="p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow"
              on:click={() => toggleBookmark(item.id)}
            >
              {#if item.bookmarked}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              {/if}
            </button>
          </div>
          <div class="absolute bottom-2 left-2 text-xs bg-white/80 px-2 py-1 rounded text-gray-700">
            {item.date}
          </div>
        </div>
      {:else}
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="flex-1">
            <h3 class="font-medium text-base">{item.title}</h3>
            <p class="text-xs text-gray-500 mt-1">{item.date} · {item.type}</p>
          </div>
          
          <button 
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            on:click={() => toggleBookmark(item.id)}
          >
            {#if item.bookmarked}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            {/if}
          </button>
        </div>
      {/if}
    {/each}
    
    {#if filteredItems.length === 0}
      <div class="p-8 text-center text-gray-500">
        <p>No items found</p>
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
