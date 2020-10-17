<script>
  import { getContext } from "svelte";

  const { store, removePollOption, endPoll } = getContext('assembly')
  
  $: ({ isAdmin, inLobby } = $store.info)
  $: poll = $store.poll
  $: isPolling = $store.state === 'polling'
</script>

{#if poll}
  <h3>Subject: {poll.subject}</h3>
  {#if poll.options}
    <ul>
      {#each poll.options as option}
      <li>
        {option}
        {#if isAdmin && inLobby && !isPolling}
          <button on:click={() => removePollOption(option)}>
          Remove
        </button>
        {/if}
      </li>
      {/each}
    </ul>
  {:else}
    <p>No options defined yet</p>
  {/if}

  {#if isAdmin && isPolling}
    <button class='warning' on:click={endPoll}>Stop current poll</button>
  {/if}
{:else}
<p>Is still being drafted</p>
{/if}