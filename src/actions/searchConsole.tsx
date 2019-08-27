// import { API } from 'aws-amplify';

// Defining our Actions for the reducers.
import { API } from 'aws-amplify';

export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SEARCH_RESULTS = 'SEARCH_RESULTS';

export const changeView = (view: 'grid' | 'list') => dispatch => {
  dispatch({
     type: CHANGE_VIEW,
     view: view
   });
};

export const search = (input: string) => async dispatch => {
  const queryStringParameters = { query: input, limit: 50, type: 'concept'};

  const results = await API.get('tba21', 'tags', { queryStringParameters: queryStringParameters });

  dispatch({
    type: SEARCH_RESULTS,
    results: results.tags,
    search_query: input
  });

};
