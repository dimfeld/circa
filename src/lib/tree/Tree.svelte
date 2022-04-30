<script lang="ts">
  import type { HierarchyPointLink } from 'd3';
  import type { HierarchyPointNode } from 'd3';
  import { hierarchy, tree, linkVertical } from 'd3';

  let width = 0;

  interface Node {
    id: number;
    label: string;
    children?: Node[];
  }

  const data: Node = {
    id: 1,
    label: 'A thing',
    children: [
      {
        id: 10,
        label: 'Child 1',
        children: [
          { id: 20, label: 'Subchild 1' },
          { id: 21, label: 'Subchild 2' },
        ],
      },
      { id: 11, label: 'Child 2' },
      { id: 12, label: 'Child 3' },
    ],
  };

  const nodeWidth = 150;
  const nodeHeight = 128;
  const nodeBoxHeight = 64;

  const boxContentTop = (nodeHeight - nodeBoxHeight) / 2;
  const boxContentBottom = (nodeHeight + nodeBoxHeight) / 2;

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
        link.source.x + centerX + nodeWidth / 2,
        link.source.y + boxContentBottom,
      ] as [number, number],
      target: [
        link.target.x + centerX + nodeWidth / 2,
        link.target.y + boxContentTop,
      ] as [number, number],
    };

    return linkFn(coords);
  };
</script>

<div class="h-full w-full overflow-auto" bind:clientWidth={width}>
  {#each nodes as node (node.data.id)}
    <div
      style:width="{nodeWidth}px"
      style:height="{nodeHeight}px"
      style:top="{node.y}px"
      style:left="{node.x + centerX}px"
      class="absolute grid place-items-center"
    >
      <div
        style:height="{nodeBoxHeight}px"
        class="w-32 border border-gray-500 px-3 py-1"
      >
        {node.data.label}
      </div>
    </div>
  {/each}

  <svg class="h-full w-full fill-transparent stroke-black">
    {#each nodes as node (node.data.id)}
      {#each node.links() as link}
        <path d={generateLinkPath(link)} />
      {/each}
    {/each}
  </svg>
</div>
