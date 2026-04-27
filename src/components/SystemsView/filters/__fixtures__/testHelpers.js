const { useInfiniteQuery } = require('@tanstack/react-query');

export { useInfiniteQuery };

export function makePage(results, { page = 1, perPage = 50, total } = {}) {
  const resolvedTotal = total ?? results.length;
  const resultsWithIds = results.map((g, i) => ({
    ...g,
    id:
      g.id ??
      `00000000-0000-4000-8000-${String(page * 10000 + i).padStart(12, '0')}`,
  }));
  return {
    results: resultsWithIds,
    page,
    per_page: perPage,
    total: resolvedTotal,
  };
}

export function mockGroupsInfiniteQuery(overrides = {}) {
  const fetchNextPage = jest.fn().mockResolvedValue(undefined);
  const {
    pages = [
      makePage([
        {
          name: 'Workspace 1',
          host_count: 3,
          id: 'aaaaaaaa-bbbb-4ccc-dddd-aaaaaaaaaaaa',
        },
      ]),
    ],
    isPending = false,
    isFetching = false,
    hasNextPage = false,
    ...rest
  } = overrides;

  useInfiniteQuery.mockReturnValue({
    data: isPending
      ? undefined
      : { pages, pageParams: pages.map((_, i) => i + 1) },
    fetchNextPage,
    hasNextPage,
    isFetching,
    isPending,
    ...rest,
  });

  return { fetchNextPage };
}
