<script>
  export let votes = []
</script>

{#if votes.length}
  <article>
    <h2>Past votes</h2>

    {#each votes as vote}
      <article class='vote'>
        <h3>{vote.subject}</h3>

        <h4>Present:</h4>
        <ul>
          {#each vote.users as user}
            <li>{user}</li>
          {/each}
        </ul>

        <h4>Results:</h4>
        <ul class='votes'>
          {#each Object.entries(vote.votes)
            .map(([key, count]) => ({
              title: vote.options[key] ?? "Invalid",
              key,
              count
            }))
            .sort((a, b) => b.count - a.count)
            as { title, key, count}}
            <li>{title}: <span>{count}</span></li>
          {/each}
        </ul>

      </article>
    {/each}
  </article>
{/if}

<style>
  .vote {
    background: var(--dark-gray);
  }
  .vote h3 {
    margin-top: 0;
  }
  .votes {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
  }
  .votes li {
    padding: .5rem;
    margin: 0.2rem;
    border-radius: .3rem;
    background: var(--gray);
    border: var(--gray);
    color: var(--white);
  }
  .votes li span {
    font-weight: bold;
    margin: .3rem;
  }
</style>