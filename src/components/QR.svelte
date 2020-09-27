<script>
    import QRCode from 'qrcode'

    export let text
    let version, errorCorrectionLevel, maskPattern, toJSISFunc

    $: code = QRCode.create(text, { version, errorCorrectionLevel, maskPattern, toJSISFunc})
</script>

{#if text}
    <svg viewBox={`0 0 ${code.modules.size} ${code.modules.size}`}>
        {#each [...code.modules.data.entries()]
            .filter(([v, i]) => v)
            .map(([v, i]) => ({ x: i % code.modules.size, y: Math.floor(i / code.modules.size) }))
            as { x, y }
        }
            <rect {x} {y} width=1 height=1 fill=black />
        {/each}
    </svg>
{/if}
