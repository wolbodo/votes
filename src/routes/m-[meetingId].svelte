<script>
	import { stores } from '@sapper/app';
    const { page, session } = stores();

</script>

<h1>Welcome to meeting</h1>

<pre>Session: {JSON.stringify($session, null, 2)}</pre>
<pre>Page: {JSON.stringify($page, null, 2)}</pre>
