import React from 'react';
import { connect } from 'react-redux';
import { END_FLAP_HEIGHT } from 'd2-ui/lib/controlbar/ControlBar';

import EditBar from './EditBar';
import DashboardsBar from './DashboardsBar';
import { fromEditDashboard, sGetSelectedDashboard } from '../reducers';

import './ControlBarContainer.css';

const style = {
    leftControls: {
        display: 'inline-block',
        fontSize: 16,
        float: 'left',
        height: '36px',
    },
    rightControls: {
        display: 'inline-block',
        float: 'right',
    },
};

const ControlBar = ({ edit, dashboardId, dashboardName, deleteAccess }) => {
    return edit ? (
        <EditBar
            dashboardId={dashboardId}
            dashboardName={dashboardName}
            deleteAccess={deleteAccess}
            style={style}
        />
    ) : (
        <DashboardsBar dashboardId={dashboardId} controlsStyle={style} />
    );
};

const mapStateToProps = state => {
    const dashboard = sGetSelectedDashboard(state);

    return {
        edit: fromEditDashboard.sGetIsEditing(state),
        dashboardId: dashboard ? dashboard.id : '',
        dashboardName: dashboard ? dashboard.name : '',
        deleteAccess: dashboard ? dashboard.access.delete : false,
    };
};

const ControlBarCt = connect(mapStateToProps, null)(ControlBar);

export default ControlBarCt;

export const CONTROL_BAR_ROW_HEIGHT = 36;
export const CONTROL_BAR_OUTER_HEIGHT_DIFF = 24;

export const getInnerHeight = rows => {
    return rows * CONTROL_BAR_ROW_HEIGHT;
};

export const getOuterHeight = (rows, expandable) => {
    const flapHeight = !expandable ? END_FLAP_HEIGHT : 0;

    return getInnerHeight(rows) + CONTROL_BAR_OUTER_HEIGHT_DIFF + flapHeight;
};
