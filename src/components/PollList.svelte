<script>
  import { getContext } from "svelte";

  const { store } = getContext('assembly')
  

  const sortVotes = votes => Object.entries(votes).sort(
    ([optionA, countA], [optionB, countB]) => countB - countA
  )
  const reverse = array => {
    if (!array.length) return []
    
    const result = []
    for (let i=array.length; i--; i >= 0) {
      console.log(i)
      result.push(array[i])
    }
    console.log("Array:", array, result)
    return result
  }

  $: polls = reverse($store.previousPolls)
</script>
<!-- {
  "subject": "Testeing",
  "options": [
    "alksdjflskdjf"
  ],
  "votes": {
    "__invalid__": 1,
    "alksdjflskdjf": 0
  }
} -->
<content class='polls'>
  <h2>Results</h2>
  {#if polls}
    {#each polls as { subject, options, votes }}
      <section>
        <h3>{subject}</h3>
        <ul>
          {#each sortVotes(votes) as [option, count]}
            <li>{option === '__invalid__' ? 'invalid' : option}: ({count} votes)</li>
          {/each}
        </ul>
        <p>Total: {Object.values(votes).reduce((sum, current) => sum + current, 0)} votes</p>
      </section>
    {:else}
      <p>No polls yet</p>
    {/each}
  {:else}
    <p>No polls yet</p>
  {/if}
</content>
