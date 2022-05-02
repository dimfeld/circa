<script lang="ts">
  import type { Node, NodeDisplayType, NodeValue } from './data';
  import { format } from 'd3';

  const expFormat = format('~e');

  export let node: Node;

  $: value = node.value;

  function formatValue(n: NodeValue) {
    if (n.num === null || n.denom === null) {
      return 'unknown';
    } else if (n.denom === 1 || node.displayType === 'plain') {
      return n.num / n.denom;
    } else if (node.displayType === 'fraction') {
      return `${n.num} / ${n.denom}`;
    } else if (node.displayType === 'exp') {
      return expFormat(n.num / n.denom);
    }
  }

  const displayTypes: {
    type: NodeDisplayType;
    class?: string;
    label: string;
  }[] = [
    { type: 'fraction', label: 'x/y' },
    { type: 'exp', label: 'E', class: 'font-medium' },
    { type: 'plain', label: 'n', class: 'italic' },
  ];
</script>

<div class="node-contents w-32 border border-gray-200 px-3 py-1 shadow">
  {#if node.children?.length}
    <span class="text-sm">{formatValue($value)}</span>
  {:else}
    <input type="number" class="text-sm w-24 border" bind:value={$value.num} />
  {/if}

  <div>{node.label}</div>

  <div class="flex justify-end text-xs">
    {#each displayTypes as t}
      <button
        type="button"
        class="border px-1 {t.class || ''}"
        class:bg-blue-100={node.displayType === t.type}
        on:click={() => (node.displayType = t.type)}>{t.label}</button
      >
    {/each}
  </div>
</div>

<style>
  .node-contents {
    height: var(--nodeBoxHeight);
  }
</style>
