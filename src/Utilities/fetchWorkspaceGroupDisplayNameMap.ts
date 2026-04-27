import { getGroupsById } from '../api/hostInventoryApiTyped';
import { UNGROUPED_HOSTS_LABEL } from './constants';
import { fetchUngroupedHostsGroupMeta } from './fetchUngroupedHostsGroupMeta';

/**
 * Resolves workspace (inventory group) ids to display names for toolbar chips.
 */
export async function fetchWorkspaceGroupDisplayNameMap(
  groupIds: string[] | undefined,
): Promise<Record<string, string>> {
  const ids = [...new Set(groupIds?.filter(Boolean) ?? [])];
  if (ids.length === 0) return {};

  const data = await getGroupsById({
    groupIdList: ids,
    page: 1,
    perPage: Math.max(ids.length, 1),
  });

  const map: Record<string, string> = {};
  for (const g of data?.results ?? []) {
    if (g?.id) {
      map[g.id] = g.ungrouped ? UNGROUPED_HOSTS_LABEL : (g.name ?? '');
    }
  }

  const ungroupedMeta = await fetchUngroupedHostsGroupMeta();
  if (ungroupedMeta?.id && ids.includes(ungroupedMeta.id)) {
    map[ungroupedMeta.id] = UNGROUPED_HOSTS_LABEL;
  }

  return map;
}
