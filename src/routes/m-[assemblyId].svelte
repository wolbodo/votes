<script>
    import { onMount } from 'svelte'
    import { stores, goto } from '@sapper/app'

    const { page, session } = stores();

    let ws
    let open = false
    
	onMount(() => {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'

        ws = new WebSocket(`${protocol}//${window.location.host}/${$page.params.assemblyId}`)
        ws.addEventListener('message', event => {
            const data = JSON.parse(event.data);
            console.log("Data:", data)
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
</script>

<h1>Welcome to assembly</h1>
<a href={`http://localhost:3000/m-${$page.params.assemblyId}`}>http://localhost:3000/m-{$page.params.assemblyId}</a>

{#if !ws}
    Loading
{:else}
    Got socket
{/if}

<pre>Session: {JSON.stringify($session, null, 2)}</pre>
<pre>Page: {JSON.stringify($page, null, 2)}</pre>
