import { SearchStoryParams } from 'REST/story';
import {WP_REST_API_Posts} from 'wp-types';
import {
    FETCH_STORIES_LOADING,
    FETCH_STORIES_SUCCESS,
  } from "../../actions/story/storyList";
  
  export interface StoryListState {
    status: typeof FETCH_STORIES_LOADING | typeof FETCH_STORIES_SUCCESS
    stories: WP_REST_API_Posts
    totalStoriesInDatabase: number
    query: SearchStoryParams | null
  }
  
  const initialState: StoryListState = {
    status: FETCH_STORIES_LOADING,
    totalStoriesInDatabase: 0,
    stories: [],
    query: null
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
          totalStoriesInDatabase: action.payload.totalStoriesInDatabase,
        };
  
      default:
        return state;
    }
  };
  