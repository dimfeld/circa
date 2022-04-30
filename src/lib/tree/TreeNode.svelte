<script lang="ts">
  import type { Node } from './types';

  export let node: Node;
</script>

{#if node.children?.length}
  <span class="text-sm">Calculated</span>
{:else}
  <input type="text" class="text-sm w-24 border" bind:value={node.value} />
{/if}

<div>{node.label}</div>
