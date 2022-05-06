<script lang="ts">
  import {
    type TreeManager,
    type Node,
    type NodeDisplayType,
    type NodeValue,
  } from './data';
  import Dropdown from '$lib/components/Dropdown.svelte';
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
    { type: 'plain', label: 'n', class: 'italic' },
    { type: 'exp', label: 'E', class: 'font-medium' },
    { type: 'fraction', label: 'x/y' },
  ];

  $: displayType =
    displayTypes.find((d) => node.displayType === d.type) ?? displayTypes[0];
</script>

<div
  class="node-contents relative flex w-32 flex-col border border-gray-200 px-3 py-1 shadow"
>
  {#if node.children?.length}
    <span class="text-sm">{formatValue($value)}</span>
  {:else}
    <input
      type="number"
      class="text-sm w-full border"
      bind:value={$value.num}
    />
  {/if}
  <div class="mt-1 flex items-center justify-between text-sm font-medium">
    <span>{node.label}</span>
    <Dropdown>
      <button
        slot="button"
        type="button"
        class="ml-1 border px-1 text-xs {displayType.class}"
        >{displayType.label}</button
      >
      <div class="flex w-full flex-col items-center">
        <header class="whitespace-nowrap">Display Mode</header>
        <div class="flex justify-start text-xs">
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
    </Dropdown>
  </div>

  <div class="absolute inset-x-0  bottom-0 flex justify-center text-xs">
    <button type="button"> Breakout </button>
  </div>
</div>

<style>
  .node-contents {
    height: var(--nodeBoxHeight);
  }
</style>
