<script>
  import { getContext } from "svelte";
  import ClientList from '../../components/ClientList.svelte'
  import PollView from '../../components/PollView.svelte'
  import PollEdit from '../../components/PollEdit.svelte'

  const { store } = getContext('assembly')
  
  $: ({ isAdmin } = $store.info)

  $: isPolling = $store.state === 'polling'
  
</script>

<ClientList />

{#if isPolling}
<section>
  <h2>Poll in progress</h2>

  <PollView />
</section>
{:else}
  <section>
    <h2>Upcoming poll:</h2>

    {#if isAdmin && !isPolling }
      <PollEdit />
    {/if}
    <PollView />
  </section>
{/if}

