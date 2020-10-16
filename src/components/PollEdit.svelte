<script>
  import { getContext } from "svelte";

  const { store, setPollInfo, addPollOption, startPoll } = getContext('assembly')

  let pollSubject, newPollOption
  
  $: ({ isAdmin } = $store.info)
</script>

{#if isAdmin}
  <form on:submit|preventDefault={() => {
    setPollInfo(pollSubject)
    pollSubject = ''
  }}>
  <label for="pollSubject">Subject</label>
  <input required id="pollSubject" bind:value={pollSubject} />

  <button>Set subject</button>
  </form>
  <form on:submit|preventDefault={() => {
    addPollOption(newPollOption)
    newPollOption = ''
  }}>
  <label for="pollOption">Option</label>
  <input required id="pollOption" bind:value={newPollOption} />

  <button>Add poll option</button>
  </form>
  <button on:click={() => startPoll()}>Start poll</button>
{/if}