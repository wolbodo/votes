<script>
    import { onMount } from 'svelte'
    import { stores, goto } from '@sapper/app'

    const { page, session } = stores();

    let ws
    let open = false
    let clientList = []

    $: assemblyId = $page.params.assemblyId
    
	onMount(() => {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'

        ws = new WebSocket(`${protocol}//${window.location.host}/${assemblyId}`)
        ws.addEventListener('message', event => {
            const { data, type} = JSON.parse(event.data);

            switch (type) {
                case 'clientList':
                    clientList = data
                    break
                case 'requestIdentity':
                    goto(`a-${assemblyId}/hello`)
                    break
                default:
                    console.log("MSG:", type, data)
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
</script>

<h1>Welcome to assembly</h1>
<a href={`http://localhost:3000/m-${assemblyId}`}>http://localhost:3000/m-{assemblyId}</a>

{#if !ws}
    Loading
{:else}
    Got session
{/if}

<ul>
    {#each clientList as { name, socket }}
        <li>{name}: {getWSReadyState(socket)}</li>
    {/each}
</ul>
    

<pre>Session: {JSON.stringify($session, null, 2)}</pre>
<pre>Page: {JSON.stringify($page, null, 2)}</pre>
