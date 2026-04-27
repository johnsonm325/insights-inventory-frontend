import { useQuery } from '@tanstack/react-query';
import { fetchWorkspaceGroupDisplayNameMap } from '../fetchWorkspaceGroupDisplayNameMap';

export const stableIdsKey = (groupIds: string[] | undefined): string =>
  [...new Set(groupIds ?? [])].filter(Boolean).sort().join(',');

export type UseWorkspaceGroupDisplayNamesOptions = {
  /**
   * When false, the query does not run (e.g. RBAC). When omitted, runs whenever
   * there is at least one non-empty id in `groupIds`.
   */
  enabled?: boolean;
};

/**
 * Resolves workspace group ids to display names (shared by Systems view and inventory toolbar).
 */
export const useWorkspaceGroupDisplayNames = (
  groupIds: string[] | undefined,
  options?: UseWorkspaceGroupDisplayNamesOptions,
) => {
  const key = stableIdsKey(groupIds);
  const enabled =
    key.length > 0 &&
    (options?.enabled !== undefined ? options.enabled : true);

  return useQuery({
    queryKey: ['workspace-group-display-names', key],
    queryFn: () => fetchWorkspaceGroupDisplayNameMap(groupIds),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
