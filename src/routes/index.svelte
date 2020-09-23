<script>
	import { stores } from '@sapper/app';
	const { preloading, page, session } = stores();

	import { onMount } from 'svelte'
	let message
	let ws
	onMount(() => {
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}`);
		ws.addEventListener('message', event => {
			const data = JSON.parse(event.data);
			console.log("Data:", data)
		});
	})

	function send() {
		ws.send(JSON.stringify({
			action: 'message',
			content: message
		}))
		message = ''
	}
</script>



<style>
	h1, figure, p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	figure {
		margin: 0 0 1em 0;
	}

	img {
		width: 100%;
		max-width: 400px;
		margin: 0 0 1em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h1>Great success!</h1>

<pre>{JSON.stringify($session)}</pre>

{#if ws}
	<textarea bind:value={message} on:enter={send}></textarea>
	<button on:click={send}>Send</button>
{/if}

<figure>
	<img alt='Success Kid' src='successkid.jpg'>
	<figcaption>Have fun with Sapper!</figcaption>
</figure>

<p><strong>Try editing this file (src/routes/index.svelte) to test live reloading.</strong></p>
