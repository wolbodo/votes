<script>
	import { goto } from '@sapper/app';

    let creating = false

	let name
	let email

	async function createAssembly() {
        try {
            creating = true
            const response = await fetch('/create', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name, email
                })
            })
            if (response.status !== 201) {
                throw new Error("Could not create assembly")
            }
            const { assemblyId } = await response.json()
            goto(`/a-${assemblyId}`)
        } catch (e) {
            throw e
        } finally {
            creating = false
        }
	}
</script>


<svelte:head>
	<title>Assemblies|create</title>
</svelte:head>

<h1>Welcome, create a new assembly!</h1>

<form on:submit|preventDefault={createAssembly} disabled={creating}>
	<label for='name'>Name</label>
	<input required id='name' bind:value={name} />

	<label for='email'>Email</label>
	<input required id='email' type='email' bind:value={email} />

	<button>Start assembly</button>
</form>

<style>
    form > * {
        display: block;
    }
</style>