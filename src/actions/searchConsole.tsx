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

    for (let i = 0; i < result.results ; i++) {
      if (Array.isArray(result[i].s3_key)) {
        result[i].file = await getCDNObject(result[i].s3_key[1]);
      } else {
        if (result[i].s3_key) {
          result[i].file = await getCDNObject(result[i].s3_key);
        }
      }
    }

    dispatch({
     type: SEARCH_RESULTS,
     results: result.results,
   });
  }
};
