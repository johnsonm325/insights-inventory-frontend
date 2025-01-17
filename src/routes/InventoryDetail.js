import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import { Link } from 'react-router-dom';
import { entitesDetailReducer, addNewListener } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import registryDecorator from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { Skeleton, SkeletonSize, PageHeader, Main } from '@redhat-cloud-services/frontend-components';
import '@redhat-cloud-services/frontend-components-inventory-general-info/index.css';
import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';
import '@redhat-cloud-services/frontend-components-inventory-vulnerabilities/dist/css/index.css';
import { SystemCvesStore } from '@redhat-cloud-services/frontend-components-inventory-vulnerabilities';
import { routes } from '../Routes';

@registryDecorator()
class Inventory extends Component {

    constructor(props, ctx) {
        super(props, ctx);
        this.loadInventory();

        this.state = {};
    }

    async loadInventory() {
        this.props.clearNotifications();
        const {
            inventoryConnector,
            INVENTORY_ACTION_TYPES,
            mergeWithDetail
        } = await asyncInventoryLoader();
        this.getRegistry().register({
            ...mergeWithDetail(entitesDetailReducer(INVENTORY_ACTION_TYPES))
        });

        const removeListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITY,
            callback: ({ data }) => {
                data.then(payload => {
                    this.props.loadEntity(payload.results[0].id);
                    removeListener();
                });
            }
        });

        const { InventoryDetailHead, AppInfo } = inventoryConnector();

        SystemCvesStore && this.getRegistry().register({ SystemCvesStore });

        this.setState({
            InventoryDetail: InventoryDetailHead,
            AppInfo
        });
    }

    render() {
        const { InventoryDetail, AppInfo } = this.state;
        const { entity, currentApp } = this.props;
        const classNames = `${
            currentApp && currentApp === 'general_information' ?
                'ins-c-inventory__detail--general-info' :
                ''
        }`;
        return (
            <Fragment>
                <PageHeader className={`pf-m-light ins-inventory-detail ${classNames}`}>
                    <Breadcrumb>
                        <BreadcrumbItem><Link to={routes.table}>Inventory</Link></BreadcrumbItem>
                        <BreadcrumbItem isActive>
                            {
                                entity ?
                                    entity.display_name :
                                    <Skeleton size={SkeletonSize.xs} />
                            }
                        </BreadcrumbItem>
                    </Breadcrumb>
                    {InventoryDetail && <InventoryDetail hideBack />}
                </PageHeader>
                <Main className={classNames}>
                    <Grid gutter="md">
                        <GridItem span={12}>
                            {AppInfo && <AppInfo />}
                        </GridItem>
                    </Grid>
                </Main>
            </Fragment>
        );
    }
}

Inventory.contextTypes = {
    store: PropTypes.object
};

Inventory.propTypes = {
    history: PropTypes.object,
    entity: PropTypes.object,
    loadEntity: PropTypes.func,
    clearNotifications: PropTypes.func,
    currentApp: PropTypes.string
};

function mapStateToProps({ entityDetails }) {
    const activeApp = entityDetails && entityDetails.activeApp && entityDetails.activeApp.appName;
    const firstApp = entityDetails && entityDetails.activeApps && entityDetails.activeApps[0];
    return {
        entity: entityDetails && entityDetails.entity,
        currentApp: activeApp || (firstApp && firstApp.name)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadEntity: (id) => dispatch(actions.loadEntity(id)),
        clearNotifications: () => dispatch(actions.clearNotifications())
    };
}

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Inventory));
