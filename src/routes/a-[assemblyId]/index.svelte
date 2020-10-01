<script>
    import { onMount } from 'svelte'
    import { stores, goto } from '@sapper/app'

    const { page } = stores();

    let ws
    let open = false
    let clientList
    let clientInfo
    let pollInfo
    let pollSubject, newPollOption

    $: assemblyId = $page.params.assemblyId
    const actions = {
        clientInfo({ data }) {
            clientInfo = data
        },
        clientList({ data }) {
            clientList = data
        },
        pollInfo({ data }) {
            pollInfo = data
        },
        requestIdentity() {
            goto(`a-${assemblyId}/hello`)
        }
    }
	onMount(() => {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'

        ws = new WebSocket(`${protocol}//${window.location.host}/${assemblyId}`)
        ws.addEventListener('message', event => {
            const { data, type} = JSON.parse(event.data);
            console.log("Received message:", type, data)
            const action = actions[type] || (() => console.warn("Unknown message received", type))
            action({ type, data })
        })
        
        ws.addEventListener('open', () => {
            console.log("Opened")
            
            open = true
            send('join')
        })
        ws.addEventListener('error', () => goto('/'))
    })
    
	function send(type, data = {}) {
		ws.send(JSON.stringify({
			type, data
		}))
    }
    
    const getWSReadyState = readyState => {
        return {
            [WebSocket.CONNECTING]: 'Connecting',
            [WebSocket.OPEN]: 'Open',
            [WebSocket.CLOSING]: 'Closing',
            [WebSocket.CLOSED]: 'Closed',
            [undefined]: 'Unknown'
        }[readyState]
    }

    $: isAdmin = clientInfo && clientInfo.isAdmin
</script>

<h1>Welcome to assembly</h1>
<a href={`http://localhost:3000/a-${assemblyId}`}>http://localhost:3000/a-{assemblyId}</a>


{#if clientList}
    <ul>
        {#each clientList as client }
            <li>
                {client.name}
                {client.isAdmin ? '(admin)': ''}:
                {#if isAdmin}
                    {#if !client.inLobby}
                        <button on:click={send('setLobby', { name: client.name, inLobby: true })}>
                            Allow in
                        </button>
                    {:else if client.name !== clientInfo.name}
                        <button on:click={send('setLobby', { name: client.name, inLobby: false })}>
                            Kick
                        </button>
                        <button on:click={send('setAdmin', { name: client.name, isAdmin: !client.isAdmin })}>
                            {#if client.isAdmin}
                                Remove admin
                            {:else}
                                Make admin
                            {/if}
                        </button>
                    {/if}
                {/if}
                {client.inLobby ? '(in lobby)': ''}:
                {getWSReadyState(client.socket)}
            </li>
        {/each}
    </ul>

    <h2>Upcoming vote</h2>
    {#if isAdmin}
        <form on:submit|preventDefault={() => {
            send('setPollInfo', { subject: pollSubject })
            pollSubject = ''
        }}>
            <label for="voteSubject">Subject</label>
            <input required id="voteSubject" bind:value={pollSubject} />

            <button>Set subject</button>
        </form>
        <form on:submit|preventDefault={() => {
            send('addPollOption', { option: newPollOption })
            newPollOption = ''
        }}>
            <label for="pollOption">Option</label>
            <input required id="pollOption" bind:value={newPollOption} />

            <button>Add poll option</button>
        </form>
        <button on:click={() => send('startPoll')}>Start poll</button>

    {/if}

    {#if pollInfo}
        <h3>Subject: {pollInfo.subject}</h3>
        {#if pollInfo.options}
            <ul>
                {#each pollInfo.options as option}
                    <li>
                        {option}
                        {#if isAdmin}
                            <button on:click={() => send('removePollOption', { option })}>
                                Remove
                            </button>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    {:else}
        <p>Is still being drafted</p>
    {/if}

{:else}
    <h2>Waiting to be allowed in</h2>
{/if}




<pre>clientInfo: {JSON.stringify(clientInfo, null, 2)}</pre>