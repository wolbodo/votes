<script context='module'>
  import { writable } from 'svelte/store'
  export const voting = writable(null)
</script>

<script>
  import { onMount } from 'svelte'
  let users = new Map()
  const TOPIC = 'https://vote
  .wolbodo.nl/state.json'

  onMount(async () => {

    const url = new URL('https://mercure.wolbodo.nl/.well-known/mercure');
    url.searchParams.append('topic', '/.well-known/mercure/subscriptions/{topic}/{subscriber}');

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("message", function(e) {
      const data = JSON.parse(e.data)

      if (data.type === 'Subscription' && data.topic === TOPIC) {
        const { payload, active } = data
        users.set(payload.name, { ...payload, active })
        users = users
      }
    })

    // Load all existing subscriptions`
    const response = await fetch(`https://mercure.wolbodo.nl/.well-known/mercure/subscriptions/${encodeURIComponent(TOPIC)}`, { credentials: 'include' })
    const data = await response.json()

    data.subscriptions.forEach(({ active, payload }) => {
      users.set(payload.name, { ...payload, active })
    })
    users = users

    return () => eventSource.close()
  })
</script>

<article class:voting={!!$voting}>
  <h2>Present:</h2>
  <ul>
    {#each [...users.entries()] as [name, { active, isBoard }]}
    <li class:active class:isBoard class:voting={$voting?.includes(name)}>
      {name}
    </li>
    {/each}
  </ul>
</article>

<style>
  @counter-style board {
    system: cyclic;
    symbols: "⭐";
    suffix: " ";
  }
  @counter-style person {
    system: cyclic;
    symbols: "👤";
    suffix: " ";
  }
  @counter-style waiting {
    system: cyclic;
    symbols: "🕞";
    suffix: " ";
  }

  ul {
    display: flex;
    list-style: none;
    padding: .5rem;

    max-height: 20vh;
    overflow: auto;
  }

  li {
    background: var(--gray);
    padding: .5rem;
    margin: .2rem;
    border-radius: .3rem;
    color: var(--light-gray);
    list-style: person inside;
  }
  li.active {
    outline: 2px solid var(--yellow);
    background: transparent;
    color: var(--white);
  }
  li.isBoard {
    list-style: board inside;
  }
  .voting li.voting {
    outline: 2px solid var(--red);
    list-style: waiting inside;
  }
</style>