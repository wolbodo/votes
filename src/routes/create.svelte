<script>
	import { stores, goto } from '@sapper/app';

    const { session } = stores();
    
    let creating = false

	let name = 'Dexter'
	let email = 'dexter@dxlb.nl'

	async function createAssembly() {
        try {
            creating = true
            const response = await fetch('/create', {
                method: 'post',
                data: JSON.stringify({
                    name, email
                })
            })
            if (response.status !== 201) {
                throw new Error("Could not create assembly")
            }
            const { assemblyId } = await response.json()
            goto(`/m-${assemblyId}`)
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
	<input id='name' bind:value={name} />

	<label for='email'>Email</label>
	<input id='email' type='email' bind:value={email} />

	<button>Start assembly</button>
</form>

<style>
    form > * {
        display: block;
    }
</style>