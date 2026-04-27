import { useQuery } from '@tanstack/react-query';
import {
  fetchUngroupedHostsGroupMeta,
  type UngroupedHostsGroupMeta,
} from '../fetchUngroupedHostsGroupMeta';

const QUERY_KEY = ['inventory', 'ungrouped-hosts-group'] as const;

export function useUngroupedHostsGroupQuery(options?: {
  enabled?: boolean;
}) {
  return useQuery<UngroupedHostsGroupMeta | undefined>({
    queryKey: QUERY_KEY,
    queryFn: fetchUngroupedHostsGroupMeta,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}
