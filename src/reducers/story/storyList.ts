import {WP_REST_API_Posts} from 'wp-types';
import {
    FETCH_STORIES_LOADING,
    FETCH_STORIES_SUCCESS,
  } from "../../actions/story/storyList";
  
  export interface StoryListState {
    status: typeof FETCH_STORIES_LOADING | typeof FETCH_STORIES_SUCCESS,
    stories: WP_REST_API_Posts
  }
  
  const initialState: StoryListState = {
    status: FETCH_STORIES_LOADING,
    stories: []
  };
  
  export default (state: StoryListState = initialState, action): StoryListState => {
    if (state === undefined) {
      state = initialState;
    }
    switch (action.type) {
      case FETCH_STORIES_LOADING:
        return {
          ...state,
          status: FETCH_STORIES_LOADING,
        };
  
      case FETCH_STORIES_SUCCESS:
        return {
          ...state,
          status: FETCH_STORIES_SUCCESS,
          stories: action.payload.stories,
        };
  
      default:
        return state;
    }
  };
  