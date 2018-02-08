import React, { Component } from 'react';
import { connect } from 'react-redux';
import ControlBar from 'd2-ui/lib/controlbar/ControlBar';
import Button from 'd2-ui/lib/button/Button';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { colors } from '../colors';
import { tSaveDashboard, acClearEditDashboard } from '../actions/editDashboard';
import { tDeleteDashboard } from '../actions/dashboards';
import { CONTROL_BAR_ROW_HEIGHT, getOuterHeight } from './ControlBarContainer';

const styles = {
    save: {
        borderRadius: '2px',
        backgroundColor: colors.royalBlue,
        color: colors.lightGrey,
        fontWeight: '500',
        boxShadow:
            '0 0 2px 0 rgba(0,0,0,0.12), 0 2px 2px 0 rgba(0,0,0,0.24), 0 0 8px 0 rgba(0,0,0,0.12), 0 0 8px 0 rgba(0,0,0,0.24)',
    },
    discard: {
        color: colors.royalBlue,
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '14px',
        fontWeight: 500,
        textTransform: 'uppercase',
        padding: '5px',
        height: '36px',
        cursor: 'pointer',
    },
    buttonBar: {
        height: CONTROL_BAR_ROW_HEIGHT,
        paddingTop: '14px',
        marginLeft: '15px',
        marginRight: '15px',
    },
};

const DeleteConfirmDialog = ({
    dashboardName,
    onDeleteConfirmed,
    onContinueEditing,
    open,
}) => {
    const actions = [
        <FlatButton
            label="Delete"
            primary={true}
            onClick={onDeleteConfirmed}
        />,
        <FlatButton
            label="Continue editing"
            primary={true}
            onClick={onContinueEditing}
        />,
    ];

    const dialogText = `Are you sure you want to delete dashboard "${dashboardName}"?`;
    return (
        <Dialog
            title="Confirm delete dashboard"
            actions={actions}
            modal={true}
            open={open}
        >
            {dialogText}
        </Dialog>
    );
};

class EditBar extends Component {
    state = {
        open: false,
    };

    onConfirmDelete = () => {
        this.setState({ open: true });
    };

    onContinueEditing = () => {
        this.setState({ open: false });
    };

    onDeleteConfirmed = () => {
        this.setState({ open: false });
        this.props.onDelete(this.props.dashboardId);
    };

    render() {
        const {
            style,
            onSave,
            onDiscard,
            dashboardId,
            dashboardName,
        } = this.props;

        const controlBarHeight = getOuterHeight(1, false);

        return (
            <ControlBar
                height={controlBarHeight}
                editMode={true}
                expandable={false}
            >
                <div style={styles.buttonBar}>
                    <div style={style.leftControls}>
                        <Button style={styles.save} onClick={onSave}>
                            Save Changes
                        </Button>
                        {dashboardId ? (
                            <Button
                                style={styles.delete}
                                onClick={this.onConfirmDelete}
                            >
                                Delete dashboard
                            </Button>
                        ) : null}
                    </div>
                    <div style={style.rightControls}>
                        <button style={styles.discard} onClick={onDiscard}>
                            Exit without saving
                        </button>
                    </div>
                </div>
                <DeleteConfirmDialog
                    dashboardName={dashboardName}
                    onDeleteConfirmed={this.onDeleteConfirmed}
                    onContinueEditing={this.onContinueEditing}
                    open={this.state.open}
                />
            </ControlBar>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSave: () => {
            dispatch(tSaveDashboard());
        },
        onDiscard: () => {
            dispatch(acClearEditDashboard());
        },
        onDelete: id => {
            dispatch(tDeleteDashboard(id));
        },
    };
};

const EditBarCt = connect(null, mapDispatchToProps)(EditBar);

export default EditBarCt;
