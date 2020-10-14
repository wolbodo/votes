<script>
  import { getContext } from 'svelte';
  import { get } from 'svelte/store'
  import { goto } from '@sapper/app'

  const { id, identifyUser } = getContext('assembly')
  
  let posting = false
  let name
  let error
  
  async function identify() {
    try {
      posting = true
      error = null
      identifyUser(name)
      goto(`/a-${id}`)
    } catch (e) {
      error = e.message
      throw e
    } finally {
      posting = false
    }
  }
</script>

<svelte:head>
  <title>Assemblies|create</title>
</svelte:head>

<h1>Welcome, to join, identify yourself</h1>

<form on:submit|preventDefault={identify} disabled={posting}>
  <label for='name'>Name</label>
  <input required id='name' bind:value={name} />
  
  {#if error} {error} {/if}
  <button>Join</button>
</form>

<style>
  form > * {
    display: block;
  }
</style>