import { Item } from '../types/Item';
import { Collection } from '../types/Collection';
import { FETCH_HISTORY, PUSH_ENTITY } from '../actions/history';

export interface HistoryState {
    entities: (Item | Collection)[];
}

const initialState: HistoryState = {
    entities: []
};

export default (state: HistoryState = initialState, action) => {
    if (state === undefined) {
        state = initialState;
    }

    switch (action.type) {
        case FETCH_HISTORY:
            return {
                ...state,
                entities: state.entities
            };

        case PUSH_ENTITY:
            const existingEntity = state.entities.find(entity => entity.id === action.entity.id);
            if (existingEntity !== undefined) {
                return {
                    ...state
                };
            }

            return {
                ...state,
                entities: [
                    ...state.entities,
                    action.entity
                ]
            };

        default:
            return state;
    }
};
