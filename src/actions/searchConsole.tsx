import { API } from 'aws-amplify';
import { getCDNObject } from '../components/utils/s3File';
import { LOADINGOVERLAY } from './loadingOverlay';
import { ItemOrCollectionOrProfile } from '../reducers/searchConsole';
import { Item } from '../types/Item';
import { Collection } from '../types/Collection';
import { S3File } from '../types/s3File';

// Defining our Actions for the reducers.
export const CHANGE_VIEW = 'CHANGE_VIEW';
export const SEARCH_RESULTS = 'SEARCH_RESULTS';
export const SEARCH_RESULTS_LOADING = 'SEARCH_RESULTS_LOADING';
export const SEARCH_TOGGLE_OPEN = 'SEARCH_TOGGLE_OPEN';
export const SEARCH_CONCEPT_TAGS = 'SEARCH_CONCEPT_TAGS';

export interface CriteriaOption {
  label: string;
  value: string;
  originalValue: string;
  field: string;
}

export const toggle = (open: boolean = false) => dispatch => {
  const state = {
    type: SEARCH_TOGGLE_OPEN,
    open: open
  };

  getConceptTags();

  dispatch(state);
};

export const getConceptTags = () => async (dispatch, getState) => {
  const { searchConsole } = getState();
  if (searchConsole.concept_tags && !searchConsole.concept_tags.length) {
    try {
      API.get('tba21', 'tags', { queryStringParameters: { limit: 1000, type: 'concept'} }).then(res => {
        dispatch({ type: SEARCH_CONCEPT_TAGS, concept_tags: res.tags });
      });
    } catch (e) {
      return;
    }
  }
};

export const changeView = (view: 'grid' | 'list') => dispatch => {
  dispatch({
     type: CHANGE_VIEW,
     view: view
   });
};

export const search = (criteria: CriteriaOption[], focusArts: boolean = false, focusAction: boolean = false, focusScitech: boolean = false) => async dispatch => {
  const state = {
      type: SEARCH_RESULTS
    };

  dispatch({ type: LOADINGOVERLAY, on: true }); // Turn on the loading overlay

  try {
    let response;
    let results;

    if (!criteria || criteria.length === 0) {
      response = {};
      results = {};
    } else {
      response = await API.post('tba21', 'pages/search', {
        body: {
          criteria: criteria.map(e => ({'field': e.field, 'value': e.originalValue})),
          limit: 50,
          focus_arts: focusArts,
          focus_action: focusAction,
          focus_scitech: focusScitech
        }
      });

      results = await loadMore(response.results, 0);
    }

    Object.assign(state, {
      results: response.results,
      loadedResults: results.loadedResults,
      offset: results.offset,
      selectedCriteria: [...(criteria ? criteria : [])]
    });

  } catch (e) {
  } finally {
    dispatch(state);
    dispatch({ type: LOADINGOVERLAY, on: false }); // Turn off the loading overlay
  }
};

export const loadMoreResults = () => async (dispatch, getState) => {
  dispatch({ type: SEARCH_RESULTS_LOADING, loading: true });
  try {
    const { results, loadedResults, offset } = getState().searchConsole;
    const moreResults = await loadMore(results, loadedResults.length, offset);
    dispatch({ type: SEARCH_RESULTS, results: results, loadedResults: [...loadedResults, ...moreResults.loadedResults], offset: moreResults.offset });
  } catch (e) {
    dispatch({ type: SEARCH_RESULTS_LOADING, loading: false });
  }
};

const loadMore = async (results: ItemOrCollectionOrProfile[], amountLoaded: number, offset: number = 0): Promise<{loadedResults: ItemOrCollectionOrProfile[], offset?: number}> => {
  const response: ItemOrCollectionOrProfile[] = [];
  const counter = (results.length - amountLoaded) >= 10 ? 10 : results.length ;

  try {
    for (let i = 0; i < counter; i++) {
      let result: ItemOrCollectionOrProfile = results[offset + i];
      if (result) {

        if (result.hasOwnProperty('s3_key')) {
          const itemOrCollection = result as Item | Collection;

          const s3Key = itemOrCollection.s3_key;
          if (Array.isArray(s3Key) && s3Key.length) {
            if (s3Key[0]) {
              const file: S3File | false = await getCDNObject(s3Key[0]);
              if (file) {
                Object.assign(itemOrCollection, {file});
              }
            }
          } else if (typeof s3Key === 'string') {
            const file: S3File | false = await getCDNObject(s3Key);
            if (file) {
              Object.assign(itemOrCollection, {file});
            }
          }
        }

        response.push(result);
      }
    }

    return {
      loadedResults: response,
      offset: offset + counter
    };
  } catch (e) {
    return {
      loadedResults: response
    };
  }
};
