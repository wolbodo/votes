<script>
  import { getContext } from "svelte";
  import { getSocketState } from '../socket'

  const { store, setLobby, setAdmin } = getContext('assembly')
  
  $: ({ isAdmin, inLobby } = $store.info)
</script>

<!-- Users list -->
<h2>Users:</h2>
<ul>
  {#each $store.clients as client }
  <li>
    {client.name}
    {client.isAdmin ? '(admin)': ''}:
    {#if isAdmin && inLobby}
      {#if !client.inLobby}
        <button on:click={setLobby(client.name, true)}>
          Allow in
        </button>
      {/if}
      
      {#if client.name !== $store.info.name}
        <button on:click={setLobby(client.name, false)}>
          Kick
        </button>
        {#if client.inLobby}
          <button on:click={setAdmin(client.name, !client.isAdmin)}>
            {#if client.isAdmin}
            Remove admin
            {:else}
            Make admin
            {/if}
          </button>
        {/if}
      {/if}
    {/if}
    {client.inLobby ? '(in lobby)': ''}:
    {getSocketState(client.socket)}
  </li>
  {/each}
</ul>