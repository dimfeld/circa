<script lang="ts">
  import {
    type TreeManager,
    type Node,
    type NodeDisplayType,
    type NodeValue,
  } from './data';
  import { format } from 'd3';
  import { getContext } from 'svelte';

  const expFormat = format('~e');

  export let node: Node;

  const treeManager = getContext<TreeManager>('treeManager');

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
    label: string;
    class?: string;
  }[] = [
    { type: 'fraction', label: 'x/y' },
    { type: 'exp', label: 'E', class: 'font-medium' },
    { type: 'plain', label: 'n', class: 'italic' },
  ];
</script>

<div
  class="node-contents flex w-32 flex-col border border-gray-200 px-3 py-1 shadow"
>
  <div class="text-sm font-medium">{node.label}</div>
  {#if node.children?.length}
    <span class="text-sm">{formatValue($value)}</span>
  {:else}
    <input type="number" class="text-sm w-24 border" bind:value={$value.num} />
  {/if}

  <div class="mt-1 flex justify-end text-xs">
    {#each displayTypes as t}
      <button
        type="button"
        class="border px-1 {t.class || ''}"
        class:bg-blue-100={node.displayType === t.type}
        on:click={() => {
          node.displayType = t.type;
          treeManager.bumpVersion();
        }}>{t.label}</button
      >
    {/each}
  </div>
</div>

<style>
  .node-contents {
    height: var(--nodeBoxHeight);
  }
</style>
