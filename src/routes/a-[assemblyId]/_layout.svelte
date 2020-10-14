
<script>
  import { setContext } from 'svelte';
  import socket from './_socket'

  const assembly = socket()
  const { store, id } = assembly
  setContext('assembly', assembly)

</script>

<h1>Welcome to assembly</h1>
<a href={`http://localhost:3000/a-${id}`}>http://localhost:3000/a-{id}</a>

{#if process.browser && store}
  {#if $store.error}
    <p>Error: {$store.error}</p>
  {/if}

  <slot />
  
  <pre>store: {JSON.stringify($store, null, 2)}</pre>
{/if}