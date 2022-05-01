<script lang="ts">
  import type { Node, NodeValue } from './data';

  export let node: Node;

  $: value = node.value;

  function formatValue(n: NodeValue) {
    if (n.num === null || n.denom === null) {
      return 'unknown';
    } else if (n.denom === 1) {
      return n.num;
    } else {
      // TODO Choice of format: fraction, scientific, etc.
      return `${n.num} / ${n.denom}`;
    }
  }
</script>

{#if node.children?.length}
  <span class="text-sm">{formatValue($value)}</span>
{:else}
  <input type="number" class="text-sm w-24 border" bind:value={$value.num} />
{/if}

<div>{node.label}</div>
