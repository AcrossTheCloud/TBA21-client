import { Item } from '../types/Item';
import { Collection } from '../types/Collection';
import { CLEAR_HISTORY, FETCH_HISTORY, POP_ENTITY, PUSH_ENTITY } from '../actions/history';

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
            if (action.entity === undefined) {
                return {
                    ...state
                };
            }

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

        case POP_ENTITY:
            if (action.entity === undefined) {
                return {
                    ...state
                };
            }

            const filteredEntities = state.entities.filter((entity) => {
                return entity.id !== action.entity.id;
            });

            return {
                ...state,
                entities: filteredEntities
            };

        case CLEAR_HISTORY:
            return {
                ...state,
                entities: []
            };

        default:
            return state;
    }
};
