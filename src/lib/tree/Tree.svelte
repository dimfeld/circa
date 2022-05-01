<script lang="ts">
  import type { HierarchyPointLink } from 'd3';
  import { hierarchy, tree, linkVertical } from 'd3';
  import { interpolatePath } from 'd3-interpolate-path';
  import { tweened } from 'svelte/motion';
  import { quadInOut } from 'svelte/easing';
  import TreeNode from './TreeNode.svelte';
  import { createTreeManager, type Node } from './data';
  import { onDestroy } from 'svelte';

  const nodeWidth = 150;
  const nodeHeight = 128;
  const nodeBoxHeight = 64;

  const boxContentTop = (nodeHeight - nodeBoxHeight) / 2;
  const boxContentBottom = (nodeHeight + nodeBoxHeight) / 2;

  const treeManager = createTreeManager();
  const { data } = treeManager;
  onDestroy(treeManager.destroy);

  $: h = hierarchy($data);
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

  const tweenDuration = 250;
  const tweenEasing = quadInOut;

  function tweenXY(node: HTMLElement, { x, y }) {
    const coords = tweened([x, y], {
      duration: tweenDuration,
      easing: tweenEasing,
    });

    node.style.left = x + 'px';
    node.style.top = y + 'px';

    const coordsUn = coords.subscribe(([x, y]) => {
      node.style.left = x + 'px';
      node.style.top = y + 'px';
    });

    return {
      update({ x, y }) {
        coords.set([x, y]);
      },
      destroy: coordsUn,
    };
  }

  function tweenPath(node: SVGPathElement, path: string) {
    const dT = tweened(path, {
      duration: tweenDuration,
      easing: tweenEasing,
      interpolate: interpolatePath,
    });
    node.setAttribute('d', path);
    const dUn = dT.subscribe((d) => node.setAttribute('d', d));

    return {
      update(path: string) {
        dT.set(path);
      },
      destroy: dUn,
    };
  }
</script>

<div
  class="max-h-screen w-full overflow-auto"
  style:height={(h.height + 1) * nodeHeight + 'px'}
  style:--nodeWidth="{nodeWidth}px"
  style:--nodeHeight="{nodeHeight}px"
  style:--nodeBoxHeight="{nodeBoxHeight}px"
>
  <div class="absolute top-0 left-1/2 overflow-visible">
    {#each nodes as node (node.data.id)}
      <div use:tweenXY={node} class="node absolute grid place-items-center">
        <div class="node-contents w-32 border border-gray-200 px-3 py-1 shadow">
          <TreeNode node={node.data} />
        </div>
      </div>
    {/each}

    <svg class="overflow-visible fill-transparent stroke-black">
      {#each nodes as node (node.data.id)}
        {#each node
          .links()
          .filter((l) => l.source === node) as link (link.target.data.id)}
          <path use:tweenPath={generateLinkPath(link)} />
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
