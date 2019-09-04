// import { API } from 'aws-amplify';

// Defining our Actions for the reducers.
import { API } from 'aws-amplify';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SEARCH_RESULTS = 'SEARCH_RESULTS';

export interface CriteriaOption {
  label: string;
  value: string;
  originalValue: string;
  field: string;
  displayField: string;
}

export const changeView = (view: 'grid' | 'list') => dispatch => {
  dispatch({
     type: CHANGE_VIEW,
     view: view
   });
};

export const search = (criteria: CriteriaOption[]) => async dispatch => {
  const results: string[] = [];

  if (criteria) {

    for (let i = 0; i < criteria.length; i++) {
      const result = await API.get('tba21', 'pages/search', {
        queryStringParameters: {
          searchQuery: criteria[i].value,
          limit: 50
        }
      });
      results.push(result);
    }

    dispatch({
     type: SEARCH_RESULTS,
     results: results,
   });
  }
};
