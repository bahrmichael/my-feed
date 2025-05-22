<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let password = '';
  let error = false;
  let loading = false;

  async function handleSubmit() {
    if (browser) {
      loading = true;
      error = false;
      
      try {
        // Test the password against an API endpoint
        const response = await fetch('/api/feed', {
          headers: {
            'X-Password': password
          }
        });
        
        if (response.ok) {
          // Password is correct, save it and redirect
          localStorage.setItem('password', password);
          goto('/');
        } else {
          // Password is incorrect
          error = true;
        }
      } catch (e) {
        error = true;
      } finally {
        loading = false;
      }
    }
  }

  onMount(() => {
    // Clear any existing password on login page visit
    if (browser) {
      localStorage.removeItem('password');
    }
  });
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-semibold mb-6 text-center">Login</h1>
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      {#if error}
        <div class="p-3 bg-red-100 text-red-700 rounded">
          Invalid password
        </div>
      {/if}
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <button 
        type="submit"
        disabled={loading}
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if loading}
          Loading...
        {:else}
          Login
        {/if}
      </button>
    </form>
  </div>
</div>