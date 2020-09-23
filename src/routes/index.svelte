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

	let name = ''
	let email = ''

	async function createMeeting() {
		try {
			const response = fetch('/create', {
				method: 'post',
				data: JSON.stringify({
					name, email
				})
			})
			const { meetingId } = await response.json()
		} catch (e) {
			console.error("Error creating meeting", e)
		}
	}
</script>


<svelte:head>
	<title>Meetings</title>
</svelte:head>

<h1>Welcome!</h1>

<form on:submit|preventDefault={createMeeting}>
	<label for='name'>Name</label>
	<input id='name' bind:value={name} />

	<label for='email'>Email</label>
	<input id='email' type='email' bind:value={email} />

	<button on:click={createMeeting}>Start meeting</button>
</form>


<h2>Functionality</h2>
<ul>
	<li>
		<h3>Meeting management</h3>
		<ul>
			<li>Admin creates a new meeting</li>
			<li>People can go to unique meeting link</li>
			<li>People fill in their details (name, email)</li>
			<li>Admin allows people in</li>
			<li>Admin removes people</li>
		</ul>
	</li>
	<li>
		<h3>Admin creates a vote</h3>
		<ul>
			<li>People can vote</li>
			<li>When all people voted, vote closes</li>
			<li>Or, when admin closes vote</li>
			<li>Who voted will be streamed to everyone</li>
			<li>When vote is closed, results will be distributed.</li>
		</ul>
	</li>
</ul>

<h2>Screens</h2>
<ul>
	<li>Welcome</li>
	<li>Create user</li>
	<li>[user] Meeting overview</li>
	<li>[admin] Meeting overview</li>
	<li>[admin] Vote creation</li>
	<li>[user] Vote screen</li>
</ul>


<pre>{JSON.stringify($session)}</pre>

{#if ws}
	<textarea bind:value={message} on:enter={send}></textarea>
	<button on:click={send}>Send</button>
{/if}

<figure>
	<img alt='Success Kid' src='successkid.jpg'>
	<figcaption>Have fun with Sapper!</figcaption>
</figure>



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