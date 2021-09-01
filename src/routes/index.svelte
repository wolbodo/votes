<script>
	import '../app.css';
  import { onMount } from 'svelte'

  import { default as UserList, voting } from '$lib/UserList.svelte'
  import Vote from '$lib/Vote.svelte'
  import Votes from '$lib/Votes.svelte'

  let options = {}
  let user

  // State
  let currentVote
  let subject = ''
  let newOption = ''
  let pastVotes = []

  const TOPIC = 'https://vote.wolbodo.nl/state.json'

  $: isBoard = user?.roles.includes('board')

  function slugify(text) {
    return text
      .toString()                     // Cast to string
      .toLowerCase()                  // Convert the string to lowercase letters
      .normalize('NFD')       // The normalize() method returns the Unicode Normalization Form of a given string.
      .trim()                         // Remove whitespace from both sides of a string
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');        // Replace multiple - with single -
  }
  function setState(state) {
    currentVote = state.currentVote
    pastVotes = state.pastVotes
    subject = state.subject
    options = state.options

    if (currentVote) {
      $voting = currentVote.users
    } else {
      $voting = null
    }
  }

  function setOption(slug, value) {
    fetch(`/option/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(value),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  function setSubject(subject) {
    fetch(`/subject`, {
      method: 'POST',
      body: JSON.stringify(subject),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  let eventSource

  async function openEventSource() {
    console.log("Fetching credentials")

    try {
      await fetch('https://members.wolbodo.nl/auth/mercure', { credentials: 'include' })

      const url = new URL('https://mercure.wolbodo.nl/.well-known/mercure');
      url.searchParams.append('topic', TOPIC);
      
      if (eventSource) {
        eventSource.close()
      }

      eventSource = new EventSource(url, { withCredentials: true });

      eventSource.addEventListener("message", function(e) {
        const data = JSON.parse(e.data)

        if (data['@context'] === 'https://vote.wolbodo.nl/') {
          setState(data.state)
        }
      })
      eventSource.addEventListener('error', e => {
        console.error('retrying eventsource, error: ', e)
        setTimeout(() => openEventSource(), 500)
      })
    } catch (e) {
      console.error("Catching error:", e)
      setTimeout(() => openEventSource(), 500)
    }
  }


  onMount(async () => {  
    await openEventSource()

    // Load all existing options`
    {
      const response = await fetch(`https://vote.wolbodo.nl/state.json`)
      const state = await response.json()
      setState(state)
    }

    // Load the user
    {
      const response = await fetch('https://members.wolbodo.nl/auth/me', { credentials: 'include' })
      user = await response.json()
    }

    return () => eventSource.close()
  })
</script>

<nav>
  <h1>Wolbodo votes</h1>
  <a class='button' href='https://members.wolbodo.nl/logout'>Logout</a>
</nav>

<UserList />

{#if !currentVote}
  <article class='upcoming'>
    <h2>
      Upcoming:
      {#if isBoard}
        <input id='subject' value={subject} on:change={({ target }) => setSubject(target.value)} />
      {:else}
        {subject}
      {/if}
    </h2>

    {#if isBoard}
      <form on:submit|preventDefault={() => {
        setOption(slugify(newOption), newOption)
        newOption = ''
      }}>
        <label for='newOption'>New option:</label>
        <input id='newOption' bind:value={newOption} />
        <button>Add</button>
      </form>
    {/if}

    <ul class='options'>
      {#each Object.entries(options) as [slug, value]} 
        <li>
          {#if isBoard}
            <input
              on:change={({ target }) => setOption(slug, target.value)}
              {value}
            />
            <button on:click={() => fetch(`/option/${slug}`, { method: 'DELETE' })}>Remove</button>
          {:else}
            <span class='option'>
              {value}
            </span>
          {/if}
        </li>
      {/each}
    </ul>

    {#if isBoard}
      <section>
        <button on:click={() => fetch('/startVote')}>Start</button>
      </section>
    {/if}
  </article>
{:else if currentVote.users.includes(user?.name)}
  <Vote {...currentVote} />
{:else}
  <article>
    <h2>It's still going</h2>
    <p>Please wait for the vote to finish</p>
    
    {#if isBoard}
      <button on:click={() => fetch('/endVote')}>End vote</button>
    {/if}
  </article>
{/if}

<Votes votes={[...pastVotes].reverse()} />
  
<style>
  nav {
    background: var(--blue);
    margin: -.5rem;
    margin-bottom: .5rem;
    padding: .5rem 1.5rem;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .upcoming .options {
    list-style: none;
    padding: 0;
  }
  .upcoming .option {
    padding: .5rem;
    margin: 0.2rem;
    border-radius: .3rem;
    background: var(--dark-gray);
    border: var(--gray);
    color: var(--white);
    display: inline-block;
  }
  .upcoming .options li+li {
    margin-top: .2rem;
  }
</style>