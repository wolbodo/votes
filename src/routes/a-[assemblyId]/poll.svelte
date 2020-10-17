<script>
  import { getContext } from "svelte";

  const { store, castVote } = getContext('assembly')
  let choice

  $: poll = $store.poll
</script>

<form on:submit|preventDefault={() => castVote(choice)}>
  <h2>{poll.subject}</h2>
  
  {#if poll.options}
    {#each poll.options as option}
    <p>
      <input type="radio" id={option} bind:group={choice} value={option}>
      <label for={option}>{option}</label>
    </p>
    {/each}
    
    <button disabled={!choice} on:click|preventDefault={() => choice = null}>Clear poll</button>
    <button class='success'>Vote</button>
  {/if}
</form>