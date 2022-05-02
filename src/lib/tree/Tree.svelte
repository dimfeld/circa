<script lang="ts">
  import type { HierarchyPointLink } from 'd3';
  import { hierarchy, tree, linkVertical } from 'd3';
  import { interpolatePath } from 'd3-interpolate-path';
  import { tweened } from 'svelte/motion';
  import { quadInOut } from 'svelte/easing';
  import TreeNode from './TreeNode.svelte';
  import { createTreeManager, type Node, type NodeInput } from './data';
  import { onDestroy, setContext } from 'svelte';

  const nodeWidth = 150;
  const nodeHeight = 140;
  const nodeBoxHeight = 80;

  const boxContentTop = (nodeHeight - nodeBoxHeight) / 2;
  const boxContentBottom = (nodeHeight + nodeBoxHeight) / 2;

  let loadData: NodeInput | undefined;
  if (typeof window !== 'undefined') {
    const load = localStorage.getItem('circa_treedata');
    if (load) {
      loadData = JSON.parse(load);
    }
  }

  $: if (typeof window !== 'undefined') {
    console.log('saving');
    localStorage.setItem('circa_treedata', JSON.stringify($data.data));
  }

  const treeManager = createTreeManager(loadData);
  const { data } = treeManager;
  setContext('treeManager', treeManager);
  onDestroy(treeManager.destroy);

  $: h = hierarchy($data.data);
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
        <TreeNode node={node.data} />
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
</style>
