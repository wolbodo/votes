<script>
  import { getContext } from "svelte";
  import ClientList from '../../components/ClientList.svelte'
  import PollView from '../../components/PollView.svelte'
  import PollEdit from '../../components/PollEdit.svelte'
  import PollList from '../../components/PollList.svelte'

  const { store } = getContext('assembly')
  
  $: ({ isAdmin } = $store.info)
  $: isPolling = $store.state === 'polling'
  
</script>

<ClientList />


<content>
  {#if isPolling}
  <section>
    <h2>Poll in progress</h2>
    
    <PollView />
  </section>
  {:else}
  
  <section>
    <h2>Upcoming poll:</h2>
    <PollView />
  </section>
  {#if isAdmin && !isPolling }
    <section>
      <PollEdit />
    </section>
  {/if}
  {/if}
</content>

<PollList />