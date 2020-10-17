
<script>
  import { setContext } from 'svelte';
  import { stores, goto } from '@sapper/app'
  import socket from '../../socket'

  const { page } = stores()

  const assembly = socket()
  const { store, id, clearError } = assembly
  setContext('assembly', assembly)

  // Guard pages
  $: if ($store.state === 'polling') {
    if (/\/poll/.test($page.path) && $store.info.hasVoted) {
      goto(`/a-${$page.params.assemblyId}`)
    } else if (!/\/poll/.test($page.path) && !$store.info.hasVoted) {
      goto(`/a-${$page.params.assemblyId}/poll`)
    }
  } else if ($store.state === 'lobby' && /\/poll/.test($page.path)) {
    goto(`/a-${$page.params.assemblyId}`)
  }

</script>

<h1>Welcome to assembly</h1>
<a href={`http://localhost:3000/a-${id}`}>http://localhost:3000/a-{id}</a>

{#if process.browser && store}
{#if $store.error}
<section>
  <h2>Error: </h2>
  {$store.error}
  <button on:click={clearError}>Ok</button>
</section>
{/if}

<slot />

  <!-- <pre>store: {JSON.stringify($store, null, 2)}</pre> -->
  <!-- <pre>page: {JSON.stringify($page, null, 2)}</pre> -->
{/if}

<style>
  section {
    background: var(--error);
    margin: 1rem -1rem;
    padding: 1rem;
  }
  section h2 {
    display: inline;
  }
</style>