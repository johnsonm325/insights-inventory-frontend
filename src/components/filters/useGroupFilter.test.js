import React from "react";
import "@testing-library/jest-dom";
import {
  act,
  render,
  renderHook,
  waitFor,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClientWrapper,
  createTestQueryClient,
  flushPromises,
} from "../../Utilities/TestingUtilities";
import useGroupFilter from "./useGroupFilter";
import { usePermissionsWithContext } from "@redhat-cloud-services/frontend-components-utilities/RBACHook";
import { getGroups } from "../InventoryGroups/utils/api";
import { getGroupsById } from "../../api/hostInventoryApiTyped";

jest.mock("../InventoryGroups/utils/api", () => ({
  __esModule: true,
  getGroups: jest.fn(),
}));

jest.mock("../../api/hostInventoryApiTyped", () => ({
  getGroupsById: jest.fn(),
}));

jest.mock(
  "@redhat-cloud-services/frontend-components-utilities/RBACHook",
  () => ({
    __esModule: true,
    usePermissionsWithContext: jest.fn(),
  }),
);

jest.mock("../../Utilities/hooks/useUngroupedHostsGroupQuery", () => ({
  __esModule: true,
  useUngroupedHostsGroupQuery: jest.fn(),
}));

const { useUngroupedHostsGroupQuery } = require("../../Utilities/hooks/useUngroupedHostsGroupQuery");

const renderWrappedHook = (
  showNoGroupOption = false,
  client = createTestQueryClient(),
) =>
  renderHook(() => useGroupFilter(showNoGroupOption), {
    wrapper: ({ children }) => (
      <QueryClientWrapper client={client}>{children}</QueryClientWrapper>
    ),
  });

/* eslint-disable react/prop-types */
function Harness({
  showNoGroupOption = false,
  client = createTestQueryClient(),
}) {
  return (
    <QueryClientWrapper client={client}>
      <WrappedHarness showNoGroupOption={showNoGroupOption} />
    </QueryClientWrapper>
  );
}

function WrappedHarness({ showNoGroupOption = false }) {
  const [config] = useGroupFilter(showNoGroupOption);
  return config.filterValues.children;
}
/* eslint-enable react/prop-types */

const waitForGroupsToBeLoaded = async (
  searchParams = { groupType: "standard" },
  pageParams = { page: 1, per_page: 10 },
) =>
  await flushPromises().then(() =>
    waitFor(() =>
      expect(getGroups).toHaveBeenCalledWith(searchParams, pageParams),
    ),
  );

describe("groups request not yet resolved", () => {
  beforeEach(() => {
    getGroups.mockImplementation(() => new Promise(() => {})); // keep pending
    getGroupsById.mockResolvedValue({ results: [] });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
    useUngroupedHostsGroupQuery.mockImplementation(({ enabled }) => ({
      data: enabled
        ? { id: "ffffffff-ffff-4fff-ffff-ffffffffffff", hostCount: 0 }
        : undefined,
    }));
  });

  it("initial values are empty", () => {
    const { result } = renderWrappedHook();

    const [, chips, value] = result.current;
    expect(chips.length).toBe(0);
    expect(value.length).toBe(0);
  });

  it("initial filter component is empty", () => {
    const { result } = renderWrappedHook();

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          fetchNextPage={[Function]}
          groups={[]}
          hasNextPage={false}
          isFetchingNextPage={false}
          isLoading={true}
          searchQuery=""
          selectedGroupIds={[]}
          setSearchQuery={[Function]}
          setSelectedGroupIds={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });
});

describe("with some groups available", () => {
  const group1 = {
    id: "aaaaaaaa-bbbb-4ccc-dddd-000000000001",
    name: "group-1",
  };

  beforeAll(() => {
    getGroups.mockResolvedValue({ total: 1, results: [group1] });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  beforeEach(() => {
    getGroups.mockClear();
    getGroupsById.mockResolvedValue({ results: [] });
    useUngroupedHostsGroupQuery.mockImplementation(({ enabled }) => ({
      data: enabled
        ? { id: "ffffffff-ffff-4fff-ffff-ffffffffffff", hostCount: 0 }
        : undefined,
    }));
  });

  it("filter component updated with values", async () => {
    const { result } = renderWrappedHook();
    await waitForGroupsToBeLoaded();

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
     {
       "children": <SearchableGroupFilter
         fetchNextPage={[Function]}
         groups={
           [
             {
               "id": "aaaaaaaa-bbbb-4ccc-dddd-000000000001",
               "name": "group-1",
             },
           ]
         }
         hasNextPage={false}
         isFetchingNextPage={false}
         isLoading={false}
         searchQuery=""
         selectedGroupIds={[]}
         setSearchQuery={[Function]}
         setSelectedGroupIds={[Function]}
         showNoGroupOption={false}
       />,
     }
    `);
  });

  it("can use setter", async () => {
    const { result } = renderWrappedHook();
    await waitForGroupsToBeLoaded();

    const [, , , setValue] = result.current;
    act(() => {
      setValue([group1.id]);
    });
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual([group1.id]);
    expect(chips).toMatchObject([
      {
        category: "Workspace",
        chips: [
          {
            name: "group-1",
            value: group1.id,
          },
        ],
        type: "group_id",
      },
    ]);
  });

  it("can enable no group option", async () => {
    const { result } = renderWrappedHook(true);
    await waitForGroupsToBeLoaded({ groupType: "standard" });

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
     {
       "children": <SearchableGroupFilter
         fetchNextPage={[Function]}
         groups={
           [
             {
               "id": "aaaaaaaa-bbbb-4ccc-dddd-000000000001",
               "name": "group-1",
             },
           ]
         }
         hasNextPage={false}
         isFetchingNextPage={false}
         isLoading={false}
         searchQuery=""
         selectedGroupIds={[]}
         setSearchQuery={[Function]}
         setSelectedGroupIds={[Function]}
         showNoGroupOption={true}
         ungroupedHostsGroupId="ffffffff-ffff-4fff-ffff-ffffffffffff"
         ungroupedHostsHostCount={0}
       />,
     }
    `);
  });

  it("can select no group option", async () => {
    getGroupsById.mockResolvedValue({
      results: [
        {
          id: "ffffffff-ffff-4fff-ffff-ffffffffffff",
          name: "Ungrouped Hosts",
          ungrouped: true,
        },
      ],
    });
    const { result } = renderWrappedHook();
    await waitForGroupsToBeLoaded();

    const [, , , setValue] = result.current;
    act(() => {
      setValue(["ffffffff-ffff-4fff-ffff-ffffffffffff"]);
    });

    await waitFor(() => {
      const [, chips, value] = result.current;
      expect(chips.length).toBe(1);
      expect(value).toEqual(["ffffffff-ffff-4fff-ffff-ffffffffffff"]);
      expect(chips).toMatchObject([
        {
          category: "Workspace",
          chips: [
            {
              name: "Ungrouped hosts",
              value: "ffffffff-ffff-4fff-ffff-ffffffffffff",
            },
          ],
          type: "group_id",
        },
      ]);
    });
  });
});

describe("filtering", () => {
  const mockGroupId = (n) =>
    `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

  beforeAll(() => {
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  describe("local filtering (under 2 pages of data)", () => {
    beforeEach(() => {
      getGroupsById.mockResolvedValue({ results: [] });
      const total = 15; // under 2 pages of data - page size = 10
      getGroups
        .mockResolvedValueOnce({
          total,
          results: Array.from({ length: 10 }, (_, i) => ({
            id: mockGroupId(i + 1),
            name: `group-${i + 1}`,
          })),
        })
        .mockResolvedValueOnce({
          total,
          results: Array.from({ length: 5 }, (_, i) => ({
            id: mockGroupId(i + 11),
            name: `group-${i + 11}`,
          })),
        });
    });

    it("can filter groups", async () => {
      render(<Harness />);
      await act(async () => await null);
      await waitForGroupsToBeLoaded();

      const input = screen.getByPlaceholderText("Filter by workspace");
      await userEvent.type(input, "group-12");
      await waitForGroupsToBeLoaded(
        { groupType: "standard" },
        { page: 2, per_page: 10 },
      ); // Wait for the next page to load

      // There should be only one option visible (the filtered one)
      await waitFor(() =>
        expect(screen.getAllByRole("menuitem")).toHaveLength(1),
      );
      expect(
        screen.getByRole("menuitem", { name: /group-12/ }),
      ).toBeInTheDocument();
    });
  });

  describe("remote filtering (over 2 pages of data)", () => {
    beforeEach(() => {
      getGroupsById.mockResolvedValue({ results: [] });
      const total = 170; // over 2 pages of data - page size = 10
      getGroups.mockImplementation((...args) => {
        if (args[0] && args[0].name === "group-51") {
          return Promise.resolve({
            total: 1,
            results: [{ id: mockGroupId(51), name: "group-51" }],
          });
        }
        const pagination = args[1] || {};
        const page = pagination.page || 1;
        const perPage = pagination.per_page || 10;
        const offset = (page - 1) * perPage;
        const results = Array.from(
          { length: Math.min(perPage, total - offset) },
          (_, i) => ({
            id: mockGroupId(offset + i + 1),
            name: `group-${offset + i + 1}`,
          }),
        );
        return Promise.resolve({ total, results });
      });
    });

    it("can filter groups with remote search", async () => {
      render(<Harness />);
      await act(async () => await null);
      await waitForGroupsToBeLoaded();

      const input = screen.getByPlaceholderText("Filter by workspace");
      await userEvent.type(input, "group-51");

      await waitForGroupsToBeLoaded({
        name: "group-51",
        groupType: "standard",
      }); // Wait for the serach to complete

      await waitFor(() =>
        expect(screen.getAllByRole("menuitem")).toHaveLength(1),
      );

      expect(
        screen.getByRole("menuitem", { name: /group-51/ }),
      ).toBeInTheDocument();
    });
  });
});

describe("no groups:read permission", () => {
  beforeAll(() => {
    getGroupsById.mockResolvedValue({ results: [] });
    getGroups.mockClear();
    getGroups.mockResolvedValue({
      total: 1,
      results: [
        { id: "aaaaaaaa-bbbb-4ccc-dddd-000000000099", name: "group-1" },
      ],
    });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: false }));
  });

  beforeEach(() => {
    useUngroupedHostsGroupQuery.mockImplementation(({ enabled }) => ({
      data: enabled
        ? { id: "ffffffff-ffff-4fff-ffff-ffffffffffff", hostCount: 0 }
        : undefined,
    }));
  });

  it("returns no groups", async () => {
    const client = createTestQueryClient();
    renderWrappedHook(false, client);
    await flushPromises();

    expect(getGroups).not.toHaveBeenCalled();
    const data = client.getQueryState(["groups", ""])?.data;
    expect(data).toBeUndefined();
  });
});
