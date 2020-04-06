import { Item } from '../types/Item';
import { Collection } from '../types/Collection';
import {
    CLEAR,
    FETCH,
    POP_ENTITY,
    PUSH_ENTITY,
    PUSH_ENTITY_LOADING,
    PUSH_ENTITY_SUCCESS
} from '../actions/user-history';

export type UserHistoryEntity = (Item | Collection) & { isCurrent: boolean };

export interface UserHistoryState {
    entities: UserHistoryEntity[];
    loading: boolean;
}

const initialState: UserHistoryState = {
    entities: [],
    loading: false
};

export default (state: UserHistoryState = initialState, action) => {
    if (state === undefined) {
        state = initialState;
    }

    switch (action.type) {
        case FETCH:
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

            // Entity exists, let's make it the currently viewed one
            const existingEntity = state.entities.find(entity => entity.id === action.entity.id);
            if (existingEntity !== undefined) {
                return {
                    ...state,
                    entities: [
                        ...state.entities.map(entity => ({...entity, isCurrent: action.entity.id === entity.id}))
                    ]
                };
            }

            return {
                ...state,
                entities: [
                    ...state.entities.map(entity => ({...entity, isCurrent: false})),
                    {...action.entity, isCurrent: true}
                ]
            };

        case PUSH_ENTITY_LOADING:
            return {
                ...state,
                loading: true
            };

        case PUSH_ENTITY_SUCCESS:
            return {
                ...state,
                loading: false
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

        case CLEAR:
            return {
                ...state,
                entities: []
            };

        default:
            return state;
    }
};
