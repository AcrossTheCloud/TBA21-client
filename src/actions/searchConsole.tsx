// import { API } from 'aws-amplify';

// Defining our Actions for the reducers.
import { API } from 'aws-amplify';
import { getCDNObject } from '../components/utils/s3File';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SEARCH_RESULTS = 'SEARCH_RESULTS';

export interface CriteriaOption {
  label: string;
  value: string;
  field: string;
}

export const changeView = (view: 'grid' | 'list') => dispatch => {
  dispatch({
     type: CHANGE_VIEW,
     view: view
   });
};

export const search = (criteria: CriteriaOption[], focusArts: boolean = false, focusAction: boolean = false, focusScitech: boolean = false) => async dispatch => {
  if (criteria && criteria.length) {
    const result = await API.post('tba21', 'pages/search', {
      body: {
        criteria: criteria.map(e => ({'field': e.field, 'value': e.value})),
        limit: 50,
        focus_arts: focusArts,
        focus_action: focusAction,
        focus_scitech: focusScitech
      }
    });

    for (let i = 0; i < result.results.length ; i++) {
      if (result.results[i].s3_key) {
        if (Array.isArray(result.results[i].s3_key) && result.results[i].s3_key.length) {
          if (result.results[i].s3_key[0]) {
            result.results[i].file = await getCDNObject(result.results[i].s3_key[0]);
          }
        } else {
          result.results[i].file = await getCDNObject(result.results[i].s3_key);
        }
      }
    }

    console.log('Dispatch');

    dispatch({
     type: SEARCH_RESULTS,
     results: result.results,
   });
  }
};
