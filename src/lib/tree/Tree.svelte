<script lang="ts">
  import type { HierarchyPointLink } from 'd3';
  import { hierarchy, tree, linkVertical } from 'd3';
  import TreeNode from './TreeNode.svelte';
  import type { Node } from './types';

  const data: Node = {
    id: 1,
    label: 'A thing',
    children: [
      {
        id: 10,
        label: 'Child 1',
        children: [
          { id: 20, label: 'Subchild 1', value: null, exponent: 1 },
          { id: 21, label: 'Subchild 2', value: '2/5', exponent: 1 },
        ],
      },
      {
        id: 11,
        label: 'Child 2',
        value: 2,
        children: [
          { id: 20, label: 'Subchild 1', value: null, exponent: 1 },
          { id: 21, label: 'Subchild 2', value: '2/5', exponent: 1 },
        ],
      },
      { id: 12, label: 'Child 3', value: null, exponent: 2 },
    ],
  };

  const nodeWidth = 150;
  const nodeHeight = 128;
  const nodeBoxHeight = 64;

  const boxContentTop = (nodeHeight - nodeBoxHeight) / 2;
  const boxContentBottom = (nodeHeight + nodeBoxHeight) / 2;

  let width = 0;
  $: centerX = width / 2;
  $: h = hierarchy(data);
  $: layoutFn = tree<Node>().nodeSize([nodeWidth, nodeHeight]);
  $: layout = layoutFn(h);
  $: nodes = layout.descendants();

  const linkFn = linkVertical();
  /** Given the link, tweak the coordinates so that the link starts at the bottom of one box
   * and at the top of the next box */
  $: generateLinkPath = (link: HierarchyPointLink<Node>) => {
    const coords = {
      source: [
        link.source.x + nodeWidth / 2,
        link.source.y + boxContentBottom,
      ] as [number, number],
      target: [
        link.target.x + nodeWidth / 2,
        link.target.y + boxContentTop,
      ] as [number, number],
    };

    return linkFn(coords);
  };
</script>

<div
  class="w-full overflow-auto"
  style:--nodeWidth="{nodeWidth}px"
  style:--nodeHeight="{nodeHeight}px"
  style:--nodeBoxHeight="{nodeBoxHeight}px"
  bind:clientWidth={width}
>
  <div class="absolute top-0 left-1/2 overflow-visible">
    {#each nodes as node (node.data.id)}
      <div
        style:top="{node.y}px"
        style:left="{node.x}px"
        class="node absolute grid place-items-center"
      >
        <div class="node-contents w-32 border border-gray-200 px-3 py-1 shadow">
          <TreeNode node={node.data} />
        </div>
      </div>
    {/each}

    <svg class="overflow-visible fill-transparent stroke-black">
      {#each nodes as node (node.data.id)}
        {#each node.links() as link}
          <path d={generateLinkPath(link)} />
        {/each}
      {/each}
    </svg>
  </div>
</div>

<style>
  .node {
    width: var(--nodeWidth);
    height: var(--nodeHeight);
  }

  .node-contents {
    height: var(--nodeBoxHeight);
  }
</style>
