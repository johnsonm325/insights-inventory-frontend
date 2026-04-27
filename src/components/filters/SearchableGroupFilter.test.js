import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SearchableGroupFilter from './SearchableGroupFilter';

const setter = jest.fn();

const defaultProps = {
  searchQuery: '',
  setSearchQuery: () => {},
  isLoading: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: () => {},
};

it('shows no groups available message', async () => {
  render(
    <SearchableGroupFilter
      {...defaultProps}
      groups={[]}
      selectedGroupIds={[]}
      setSelectedGroupIds={() => {}}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  expect(screen.getByText('No workspaces available')).toBeVisible();
});

it('shows some groups when available', async () => {
  render(
    <SearchableGroupFilter
      {...defaultProps}
      groups={[{ id: 'aaaaaaaa-bbbb-4ccc-dddd-000000000001', name: 'group-1' }]}
      selectedGroupIds={[]}
      setSelectedGroupIds={() => {}}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  expect(
    screen.getByRole('menuitem', {
      name: /group-1/i,
    }),
  ).toBeVisible();
});

it('a group can be selected', async () => {
  const groupId = 'aaaaaaaa-bbbb-4ccc-dddd-000000000001';
  render(
    <SearchableGroupFilter
      {...defaultProps}
      groups={[{ id: groupId, name: 'group-1' }]}
      selectedGroupIds={[]}
      setSelectedGroupIds={setter}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  await userEvent.click(screen.getByText('group-1'));
  expect(setter).toHaveBeenCalledWith([groupId]);
});

it('selected groups are checked', async () => {
  const id1 = 'aaaaaaaa-bbbb-4ccc-dddd-000000000001';
  const id2 = 'aaaaaaaa-bbbb-4ccc-dddd-000000000002';
  render(
    <SearchableGroupFilter
      {...defaultProps}
      groups={[
        { id: id1, name: 'group-1' },
        { id: id2, name: 'group-2' },
      ]}
      selectedGroupIds={[id1]}
      setSelectedGroupIds={setter}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  expect(
    screen.getByRole('checkbox', {
      name: /group-1/,
    }),
  ).toBeChecked();
});
