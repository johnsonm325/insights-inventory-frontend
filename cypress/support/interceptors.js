/* eslint-disable camelcase */
/* eslint-disable rulesdir/disallow-fec-relative-imports */
import { DEFAULT_ROW_COUNT } from '@redhat-cloud-services/frontend-components-utilities';

// fixtures generated by prism mock server
import groupsFixtures from '../fixtures/groups.json';
import groupsSecondPage from '../fixtures/groupsSecondPage.json';
import groupDetailFixtures from '../fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';
import hostsFixtures from '../fixtures/hosts.json';
import edgeSystemProfile from '../fixtures/edgeSystemProfile.json';
import hostDetail from '../fixtures/hostDetail.json';

export { hostsFixtures, groupDetailFixtures };
export const groupsInterceptors = {
  'successful with some items': (fixtures = groupsFixtures) =>
    cy
      .intercept('GET', /\/api\/inventory\/v1\/groups.*/, {
        statusCode: 200,
        body: fixtures,
      })
      .as('getGroups'),
  'successful with some items second page': () =>
    cy
      .intercept('GET', '/api/inventory/v1/groups?*page=2&per_page=50*', {
        statusCode: 200,
        body: groupsSecondPage,
      })
      .as('getGroupsSecond'),
  'successful empty': () =>
    cy
      .intercept('GET', '/api/inventory/v1/groups*', {
        statusCode: 200,
        body: {
          count: 0,
          page: 1,
          per_page: DEFAULT_ROW_COUNT,
          total: 0,
        },
      })
      .as('getGroups'),
  'failed with server error': () => {
    Cypress.on('uncaught:exception', () => {
      return false;
    });
    cy.intercept('GET', '/api/inventory/v1/groups*', { statusCode: 500 }).as(
      'getGroups'
    );
  },
  'long responding': (fixtures = groupsFixtures) => {
    cy.intercept('GET', /\/api\/inventory\/v1\/groups.*/, {
      statusCode: 200,
      body: fixtures,
      delay: 42000000, // milliseconds
    }).as('getGroups');
  },
};

export const groupDetailInterceptors = {
  successful: (fixtures = groupDetailFixtures) =>
    cy
      .intercept(
        'GET',
        '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
        {
          statusCode: 200,
          body: fixtures,
        }
      )
      .as('getGroupDetail'),
  'successful with hosts': () =>
    cy
      .intercept(
        'GET',
        '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
        {
          statusCode: 200,
          body: {
            ...groupDetailFixtures,
            results: [
              {
                ...groupDetailFixtures.results[0],
                host_count: 2,
              },
            ],
          },
        }
      )
      .as('getGroupDetail'),
  empty: () =>
    cy
      .intercept(
        'GET',
        '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
        { statusCode: 404 }
      )
      .as('getGroupDetail'),
  'failed with server error': () => {
    Cypress.on('uncaught:exception', () => {
      return false;
    });
    cy.intercept(
      'GET',
      '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
      { statusCode: 500 }
    ).as('getGroupDetail');
  },
  'long responding': () => {
    cy.intercept(
      'GET',
      '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
      {
        statusCode: 200,
        body: groupDetailFixtures,
        delay: 42000000, // milliseconds
      }
    ).as('getGroupDetail');
  },
  'patch successful': () => {
    cy.intercept('PATCH', '/api/inventory/v1/groups/*', { statusCode: 200 }).as(
      'patchGroup'
    );
  },
  'post hosts successful': () => {
    cy.intercept('POST', '/api/inventory/v1/groups/*/hosts', {
      statusCode: 200,
    }).as('postHosts');
  },
  'delete successful': () => {
    cy.intercept('DELETE', '/api/inventory/v1/groups/*', {
      statusCode: 204,
    }).as('deleteGroup');
  },
};

export const deleteGroupsInterceptors = {
  'successful deletion': () => {
    cy.intercept('DELETE', '/api/inventory/v1/groups/*', {
      statusCode: 204,
    }).as('deleteGroups');
  },
  'failed deletion (invalid request)': () => {
    cy.intercept('DELETE', '/api/inventory/v1/groups/*', {
      statusCode: 400,
    }).as('deleteGroups');
  },
};

export const hostsDetailInterceptors = {
  successful: (fixtures = hostDetail) => {
    cy.intercept('GET', '/api/inventory/v1/hosts/*', {
      statusCode: 200,
      body: fixtures,
    }).as('getHostDetail');
  },
};

export const hostsDetailTagsInterceptors = {
  successful: () => {
    cy.intercept('GET', '/api/inventory/v1/hosts/*/tags*', {
      statusCode: 200,
      body: {
        total: 1,
        count: 1,
        page: 1,
        per_page: 50,
        results: {
          'fbe52803-d68a-40e1-9e39-5f9bae4a4bd0': [],
        },
      },
    }).as('getHostDetailTags');
  },
};

export const hostsInterceptors = {
  successful: (fixtures = hostsFixtures) => {
    cy.intercept('GET', '/api/inventory/v1/hosts*', {
      statusCode: 200,
      body: fixtures,
    }).as('getHosts');
  },
  'successful empty': () => {
    cy.intercept('GET', '/api/inventory/v1/hosts*', {
      statusCode: 200,
      body: {
        count: 0,
        page: 1,
        per_page: DEFAULT_ROW_COUNT,
        total: 0,
        results: [],
      },
    }).as('getHosts');
  },
  'failed with server error': () => {
    Cypress.on('uncaught:exception', () => {
      return false;
    });
    cy.intercept('GET', '/api/inventory/v1/hosts*', { statusCode: 500 }).as(
      'getHosts'
    );
  },
  successHybridSystems: () => {
    cy.intercept(
      '/api/inventory/v1/hosts*',
      { hostname: 'localhost' },
      (req) => {
        if (req.url.includes('filter[system_profile][host_type]=edge')) {
          req.reply({
            statusCode: 200,
            body: {
              count: 1,
              page: 1,
              per_page: DEFAULT_ROW_COUNT,
              total: 1,
              results: [{ ImageName: 'some-edge-device', ImageSetID: '00000' }],
            },
          });
        } else {
          req.reply({
            statusCode: 200,
            body: {
              count: 0,
              page: 1,
              per_page: DEFAULT_ROW_COUNT,
              total: 0,
              results: [],
            },
          });
        }
      }
    );
  },
};

export const systemProfileInterceptors = {
  'operating system, successful empty': () => {
    cy.intercept('GET', '/api/inventory/v1/system_profile/operating_system', {
      statusCode: 200,
      body: {
        results: [],
      },
    }).as('getSystemProfile');
  },
  'full system profile, successful with response': () => {
    cy.intercept('GET', '/api/inventory/v1/hosts/*/system_profile*', {
      statusCode: 200,
      body: edgeSystemProfile,
    }).as('getFullSystemProfile');
  },
};

export const featureFlagsInterceptors = {
  successful: () => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [],
      },
    }).as('getFeatureFlag');
  },
  edgeParitySuccessful: () => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [
          {
            name: 'edgeParity.inventory-list',
            enabled: true,
            variant: {
              name: 'disabled',
              enabled: true,
            },
          },
        ],
      },
    }).as('getEdgeFeatureFlag');
  },
  edgeParityDisabled: () => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [
          {
            name: 'edgeParity.inventory-list',
            enabled: false,
            variant: {
              name: 'disabled',
              enabled: false,
            },
          },
        ],
      },
    }).as('getEdgeFeatureFlag');
  },
  workspacesSuccessful: () => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [
          {
            name: 'platform.rbac.groups-to-workspaces-rename',
            enabled: true,
            variant: {
              name: 'disabled',
              enabled: true,
            },
          },
        ],
      },
    }).as('getWorkspacesFeatureFlag');
  },
  workspacesDisabled: () => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [
          {
            name: 'platform.rbac.groups-to-workspaces-rename',
            enabled: false,
            variant: {
              name: 'disabled',
              enabled: false,
            },
          },
        ],
      },
    }).as('getWorkspacesFeatureFlag');
  },
};

export const edgeInterceptors = {
  successful: () => {
    cy.intercept('GET', '/api/edge/v1/devices/*', {
      statusCode: 200,
      body: {
        UpdatesAvailable: [],
      },
    }).as('getDevice');
  },
};
