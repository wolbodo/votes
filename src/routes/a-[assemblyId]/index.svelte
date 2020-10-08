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
    let assemblyState
    let errorMessage

    let choice

    $: assemblyId = $page.params.assemblyId
    const actions = {
        clientInfo({ data }) {
            clientInfo = data
        },
        assemblyData({ data: { state, clients, nextPoll, poll} }) {
            clientList = clients
            pollInfo = nextPoll
            
            assemblyState = state
        },
        requestIdentity() {
            goto(`a-${assemblyId}/welcome`)
        },
        kicked() {
            goto('/kicked')
        },
        error( { data: { message }}) {
            errorMessage = message
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

            if (type !== 'error') {
                errorMessage = null
            }
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
    $: inLobby = assemblyState === 'lobby'
    $: isPolling = assemblyState === 'polling'
</script>

<h1>Welcome to assembly</h1>
<a href={`http://localhost:3000/a-${assemblyId}`}>http://localhost:3000/a-{assemblyId}</a>

{#if errorMessage}
    <p>Error: {errorMessage}</p>
{/if}

{#if clientList}
    <ul>
        {#each clientList as client }
            <li>
                {client.name}
                {client.isAdmin ? '(admin)': ''}:
                {#if isAdmin && inLobby}
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

    
    {#if inLobby}
        <h2>Upcoming poll</h2>
        {#if isAdmin}
            <form on:submit|preventDefault={() => {
                send('setPollInfo', { subject: pollSubject })
                pollSubject = ''
            }}>
                <label for="pollSubject">Subject</label>
                <input required id="pollSubject" bind:value={pollSubject} />

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
                            {#if isAdmin && inLobby}
                                <button on:click={() => send('removePollOption', { option })}>
                                    Remove
                                </button>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {:else}
                <p>No options defined yet</p>
            {/if}
        {:else}
            <p>Is still being drafted</p>
        {/if}
    {:else if isPolling}
        <form on:submit|preventDefault={() => send('castpoll', { choice })}>
            <h2>Current poll: {pollInfo.subject}</h2>
            
            {#each pollInfo.options as option}
                <p>
                    <input type="radio" id={option} bind:group={choice} value={option}>
                    <label for={option}>{option}</label>
                </p>
            {/each}

            <button on:click|preventDefault={() => choice = null}>Clear poll</button>
            <button>Cast poll</button>
        </form>
    {/if}

{:else}
    <h2>Waiting to be allowed in</h2>
{/if}




<pre>clientInfo: {JSON.stringify({
    clientList,
    clientInfo,
    pollInfo,
    pollSubject, newPollOption,
    assemblyState,
    errorMessage,
    choice
}, null, 2)}</pre>