import { Item } from '../types/Item';
import { Collection } from '../types/Collection';
import { removeTopology } from '../components/utils/removeTopology';
import { getCollectionsInCollection } from '../REST/collections';

export const FETCH_HISTORY = 'FETCH_HISTORY';
export const PUSH_ENTITY = 'PUSH_ENTITY';
export const PUSH_ENTITY_LOADING = 'PUSH_ENTITY_LOADING';
export const PUSH_ENTITY_SUCCESS = 'PUSH_ENTITY_SUCCESS';
export const POP_ENTITY = 'POP_ENTITY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';

export const fetchHistory = () => async (dispatch, getState) => {
    dispatch({
         type: FETCH_HISTORY,
         history: getState().history
     });
};

export const pushEntity = (entity?: Item | Collection) => async (dispatch) => {
    dispatch({type: PUSH_ENTITY_LOADING});

    if (entity?.__typename === 'collection') {
        const collectionsInCollection: Collection[] = removeTopology(
            await getCollectionsInCollection({id: entity.id, limit: 1000, offset: 0}),
            'collection'
        ) as Collection[];
        entity.collections = collectionsInCollection && collectionsInCollection.length ?
            collectionsInCollection.map((collection) => collection.id) as string[] :
            undefined;
    }

    dispatch({
         type: PUSH_ENTITY,
         entity
     });

    dispatch({type: PUSH_ENTITY_SUCCESS});
};

export const popEntity = (entity?: Item | Collection) => dispatch => {
    dispatch({
         type: POP_ENTITY,
         entity
     });
};

export const clearHistory = () => dispatch => {
    dispatch({
         type: CLEAR_HISTORY
     });
};
