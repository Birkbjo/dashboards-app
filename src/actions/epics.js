import { combineEpics } from 'redux-observable';
import { of } from 'rxjs/observable/of';
import { ofType } from 'redux-observable';
import { from } from 'rxjs/observable/from';
import {
    switchMap,
    mergeMap,
    //  merge,
    //   concat,
    tap,
    map,
    takeUntil,
    catchError,
    delay,
    throttleTime,
} from 'rxjs/operators';
import {
    acSetSelectedIsLoading,
    acReceivedVisualization,
    acSetSelectedId,
} from './selected';
import { concat } from 'rxjs/observable/concat';
import { merge } from 'rxjs/observable/merge';
import { actionTypes } from '../reducers';
import { acSetDashboards } from './dashboards';
import { apiFetchSelected } from '../api/dashboards';
import { loadingDashboardMsg } from '../SnackbarMessage';
import { extractFavorite } from '../Item/PluginItem/plugin';
import { withShape } from '../ItemGrid/gridUtil';
import { acReceivedSnackbarMessage, acCloseSnackbar } from './snackbar';
import { tGetMessages } from '../Item/MessagesItem/actions';
import {
    REPORT_TABLE,
    CHART,
    MAP,
    EVENT_REPORT,
    EVENT_CHART,
    MESSAGES,
} from '../itemTypes';

const getActionByItemType = id => item => {
    switch (item.type) {
        case REPORT_TABLE:
        case CHART:
        case MAP:
        case EVENT_REPORT:
        case EVENT_CHART:
            return acReceivedVisualization(extractFavorite(item), item.type);
        case MESSAGES:
            return tGetMessages(id);
        default:
            break;
    }
};

const loadDashBoard = (action$, store) =>
    action$.pipe(
        ofType(actionTypes.SET_SELECTED_LOAD),
        map(action => action.payload),
        switchMap(({ id, name }) => {
            //We create an observable from the promise,
            //as we need to return multiple actions
            const req = from(apiFetchSelected(id)).pipe(
                switchMap(selected => {
                    const dashboard = {
                        ...selected,
                        dashboardItems: withShape(selected.dashboardItems),
                    };
                    const actions = selected.dashboardItems
                        .map(getActionByItemType(id))
                        .filter(act => !!act);

                    return [acSetDashboards(dashboard, true), ...actions];
                }),
                catchError(e => [{ type: 'LOAD_DASHBOARD_ERROR' }])
            );
            //Snackbar action to observable
            const snackBar = of(
                acReceivedSnackbarMessage({
                    message: { ...loadingDashboardMsg, name },
                    open: true,
                })
            ).pipe(delay(500), takeUntil(req)); //delay it 500ms, but cancel if request has resolved in this time
            let withSnackbar = merge(snackBar, req);
            //if its loaded, we select instantly, but also send the request so we get updated data
            if (store.getState().dashboards[id].dashboardItems[0].type) {
                return concat(
                    [acSetSelectedIsLoading(false), acSetSelectedId(id)],
                    req
                );
            }
            //return the actions!
            return concat([acSetSelectedIsLoading(true)], withSnackbar, [
                acSetSelectedId(id),
                acSetSelectedIsLoading(false),
                acCloseSnackbar(),
            ]);
        })
    );

export default combineEpics(loadDashBoard);
