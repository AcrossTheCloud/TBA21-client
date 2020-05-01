import { API } from 'aws-amplify';
import { Item } from '../../types/Item';
import { getItems } from '../../REST/items';
import { removeTopology } from '../../components/utils/removeTopology';

export const FETCH_ITEMS = 'FETCH_ITEMS';
export const FETCH_MORE_ITEMS = 'FETCH_MORE_ITEMS';
export const FETCH_ITEMS_NO_ITEMS = 'FETCH_ITEMS_NO_ITEMS';
export const FETCH_ITEMS_ERROR = 'FETCH_ITEMS_ERROR';

export const fetchItems = (id?: string) => async dispatch => {
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i;

    try {
        const response = !!id && id.match(uuidRegex) ? await getItems({ uuid: id }) : await getItems({ limit: 10 });
        const responseItems = removeTopology(response) as Item[];
        if (!responseItems.length) {
          dispatch({
           type: FETCH_ITEMS_NO_ITEMS,
           items: {},
         });
        }

        let items: { [id: string]: Item } = {};
    
        responseItems.forEach( async (item: Item) => {
          Object.assign(items, { [item.s3_key]: item });
        });
    
        dispatch({
         type: FETCH_ITEMS,
         items: items,
       });

  } catch (e) {
    dispatch({
       type: FETCH_ITEMS_ERROR,
       items: {},
     });
  }
};

export const fetchMoreItems = (offset: number) => async dispatch => {
  try {
    const response = await API.get('tba21', 'items/get', {
      queryStringParameters : {
        offset: offset,
        limit: 2
      }
    });
    if (!response || response.items) {
      dispatch({
       type: FETCH_ITEMS_NO_ITEMS,
       items: {},
     });
    }

    let items: { [id: string]: Item } = {};

    response.items.forEach( (item: Item) => {
      Object.assign(items, { [item.s3_key]: item });
    });

    dispatch({
     type: FETCH_MORE_ITEMS,
     items: items,
   });

  } catch (e) {
    dispatch({
       type: FETCH_ITEMS_ERROR,
       items: {},
     });
  }
};
