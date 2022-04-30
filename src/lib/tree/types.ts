export interface Node {
  id: number;
  label: string;
  value?: number | string | null;
  exponent?: number;
  children?: Node[];
}
