import { writable, type Writable } from 'svelte/store';

export type Unit = string;

export interface NodeValue {
  num: number | null;
  denom: number | null;
  exp: number;
}

export type NodeDisplayType = 'fraction' | 'exp' | 'plain';

export interface Node {
  id: number;
  label: string;
  value: NodeValueStore;
  displayType: NodeDisplayType;
  units?: [Unit[], Unit[]];
  parent?: Node;
  children?: Node[];
}

/** Recalculate a node's value from its children */
function recalculate(node: Node | undefined) {
  if (!node?.children?.length) {
    return;
  }

  console.log(`Recalculate node ${node.id}`);

  let outputValue = node.children.reduce(
    (acc, child) => {
      let { num, denom, exp } = child.value.get();

      if (exp < 0) {
        exp = -exp;
        [num, denom] = [denom, num];
      }

      if (acc.num === null || num === null) {
        acc.num = null;
      } else {
        acc.num *= Math.pow(num, exp);
      }

      if (acc.denom === null || denom === null) {
        acc.denom = null;
      } else {
        acc.denom *= denom;
      }

      return acc;
    },
    { num: 1, denom: 1, exp: node.value.get().exp } as NodeValue
  );

  // This will set the value and propagate it upward.
  node.value.set(outputValue);
}

export interface NodeValueStore extends Writable<NodeValue> {
  get(): NodeValue;
}

export function emptyNodeValue() {
  return {
    num: null,
    denom: 1,
    exp: 1,
  };
}

export function newNode(
  nodeInput: Omit<Node, 'value' | 'displayType'> & {
    value?: NodeValue;
    displayType?: NodeDisplayType;
  }
) {
  let value: NodeValue = nodeInput.value ?? emptyNodeValue();
  let store = writable(value);

  const set = (newValue: NodeValue) => {
    value = newValue;
    store.set(value);
    recalculate(node.parent);
  };

  const nodeValueStore: NodeValueStore = {
    subscribe: store.subscribe,
    set,
    update(updateFn: (v: NodeValue) => NodeValue) {
      const newValue = updateFn(value);
      set(newValue);
    },
    get() {
      return value;
    },
  };

  let node: Node = {
    ...nodeInput,
    displayType: nodeInput.displayType ?? 'plain',
    value: nodeValueStore,
  };

  if (node.children?.length) {
    for (let child of node.children) {
      child.parent = node;
    }
  }

  return node;
}

const initialData: Node = newNode({
  id: 1,
  label: 'A thing',
  children: [
    newNode({
      id: 10,
      label: 'Child 1',
      children: [
        newNode({
          id: 20,
          label: 'Subchild 1',
        }),
        newNode({
          id: 21,
          label: 'Subchild 2',
          value: { num: 2, denom: 5, exp: 1 },
        }),
      ],
    }),
    newNode({
      id: 11,
      label: 'Child 2',
      value: { num: 2, denom: 1, exp: 1 },
      children: [
        newNode({
          id: 23,
          label: 'Subchild 1',
        }),
        newNode({
          id: 24,
          label: 'Subchild 2',
          value: { num: 2, denom: 5, exp: 1 },
        }),
      ],
    }),
    newNode({
      id: 12,
      label: 'Child 3',
      value: { num: null, denom: 1, exp: 2 },
    }),
    newNode({
      id: 13,
      label: 'Child 4',
      value: { num: null, denom: 1, exp: 2 },
    }),
  ],
});

export function createTreeManager() {
  return {
    addChildren(parent: Node, children: Node[], startIndex?: number) {
      if (!parent.children) {
        parent.children = [...children];
      } else {
        startIndex ??= parent.children.length;
        parent.children = [
          ...parent.children.slice(0, startIndex),
          ...children,
          ...parent.children.slice(startIndex),
        ];
      }

      for (let child of children) {
        child.parent = parent;
      }

      recalculate(parent);
    },
    data: writable(initialData),
    removeNode(node: Node) {
      let { parent } = node;
      if (parent?.children) {
        parent.children = parent.children.filter((c) => c !== node);
        recalculate(parent);
      }
    },
    destroy() {},
  };
}
