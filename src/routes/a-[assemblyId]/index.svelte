<script>
  import { getContext } from "svelte";
  import { getSocketState } from './_socket'

  const { store, setLobby, setAdmin } = getContext('assembly')
  
  $: ({ isAdmin, inLobby } = $store.info)
</script>


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
      {:else if client.name !== $store.info.name}
        <button on:click={setLobby(client.name, false)}>
          Kick
        </button>
        <button on:click={setAdmin(client.name, !client.isAdmin)}>
          {#if client.isAdmin}
          Remove admin
          {:else}
          Make admin
          {/if}
        </button>
      {/if}
    {/if}
    {client.inLobby ? '(in lobby)': ''}:
    {getSocketState(client.socket)}
  </li>
  {/each}
</ul>