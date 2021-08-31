<script>
  export let options = []
  export let subject = ''

  let vote = null 
</script>

<article>
  <h2>{subject}</h2>

  <form on:submit|preventDefault={() => {
    fetch(`/castVote`, {
      method: 'POST',
      body: JSON.stringify(vote),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }}>
    <section class='options'>
      {#each Object.entries(options) as [slug, title]}
        <label class:selected={slug === vote}>
          <input type='radio' bind:group={vote} value={slug} />
          {title}
        </label>
      {/each}
    </section>

      <button type=submit>Vote</button>
      <button type=button on:click={() => vote = null}>Clear vote</button>
  </form>
</article>

<style>
  .options {
    display: flex;
    flex-flow: column;
    margin: .2rem;
  }
  label {
    padding: .5rem;
    margin: 0.2rem;
    border-radius: .3rem;
    background: var(--dark-gray);
    border: var(--gray);
    color: var(--white);
  }
  label.selected {
    outline: 2px solid var(--yellow);
  }
</style>