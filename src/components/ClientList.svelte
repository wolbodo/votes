<script>
  import { getContext } from "svelte";
  import { getSocketState } from '../socket'

  const { store, setLobby, setAdmin } = getContext('assembly')
  
  $: ({ isAdmin, inLobby } = $store.info)
  $: isPolling = $store.state === 'polling'
  $: toVote = isPolling && $store.poll.toVote
</script>

<!-- Users list -->
<content>
  <section>
  <h2>Users:</h2>
  {#each $store.clients as client }
    <section class='user' class:voting={toVote && toVote.includes(client.name)}>
      <p>
        {client.name}
      </p>
      {#if client.isAdmin}
        <p>admin</p>
      {/if}

      <p class='state'>
        {client.inLobby ? '(in lobby)': ''}:
        {getSocketState(client.socket)}
      </p>

      <span class='actions'>
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
      </span>
    </section>
  {/each}
  </section>
</content>

<style>
  .voting {
    background: var(--color);
  }

  content > section {
    display: flex;
    flex-direction: column;
  }
  .user {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 .5rem;
    margin: 0.1rem 0;
  }
</style>