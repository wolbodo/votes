<script>
  import { getContext } from "svelte";
  import ClientList from '../../components/ClientList.svelte'
  import PollView from '../../components/PollView.svelte'
  import PollEdit from '../../components/PollEdit.svelte'

  const { store } = getContext('assembly')
  
  $: ({ isAdmin } = $store.info)
</script>

<ClientList />

<section>
  <h2>Upcoming poll:</h2>

  {#if isAdmin}
    <PollEdit />
  {/if}
  <PollView />
</section>

