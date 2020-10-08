<svelte:head>
	<title>Assemblies</title>
</svelte:head>

<h1>Welcome!</h1>

<h2>Functionality</h2>
<ul>
	<li>
		<h3>Assembly management</h3>
		<ul>
			<li>Admin creates a new assembly</li>
			<li>People can go to unique assembly link</li>
			<li>People fill in their details (name, email)</li>
			<li>Admin allows people in</li>
			<li>Admin removes people</li>
		</ul>
	</li>
	<li>
		<h3>Admin creates a poll</h3>
		<ul>
			<li>People can poll</li>
			<li>When all people polld, poll closes</li>
			<li>Or, when admin closes poll</li>
			<li>Who polld will be streamed to everyone</li>
			<li>When poll is closed, results will be distributed.</li>
		</ul>
	</li>
</ul>

<h2>Screens</h2>
<ul>
	<li>Welcome</li>
	<li>Create user</li>
	<li>[user] Assembly overview</li>
	<li>[admin] Assembly overview</li>
	<li>[admin] poll creation</li>
	<li>[user] poll screen</li>
</ul>

<style>
	h1 {
		text-align: center;
		margin: 0 auto;
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>