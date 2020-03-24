import { Item } from '../types/Item';
import { Collection } from '../types/Collection';

export const FETCH_HISTORY = 'FETCH_HISTORY';
export const PUSH_ENTITY = 'PUSH_ENTITY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';

export const fetchHistory = () => async (dispatch, getState) => {
    const state = {
        type: FETCH_HISTORY,
        history: getState().history
    };

    dispatch(state);
};

export const pushEntity = (entity?: Item | Collection) => dispatch => {
    const state = {
        type: PUSH_ENTITY,
        entity
    };

    dispatch(state);
};

export const clearHistory = () => dispatch => {
    const state = {
        type: CLEAR_HISTORY
    };

    dispatch(state);
};
