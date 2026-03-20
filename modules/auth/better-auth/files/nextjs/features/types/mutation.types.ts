export type MutationWithLoading<TData, TVariables> = {
  mutateAsync: (vars: TVariables) => Promise<TData>;
  isLoading: boolean;
};
