export type VoidCallback<T = unknown> = T extends object
  ? (data: T) => void
  : () => void;
