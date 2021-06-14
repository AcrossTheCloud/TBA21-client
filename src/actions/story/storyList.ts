import { getCategories, getTags, SearchStoryParams } from "REST/story";
import {
  getStoriesAndTotalStoriesInDatabase,
  getAuthors,
} from "../../REST/story";

export const FETCH_STORIES_LOADING = "FETCH_STORIES_LOADING";
export const FETCH_STORIES_LOADING_INITIAL = "FETCH_STORIES_LOADING_INITIAL";
export const FETCH_STORIES_ERROR = "FETCH_STORIES_ERROR";
export const FETCH_STORIES_INITIAL_SUCCESS = "FETCH_STORIES_INITIAL_SUCCESS";
export const FETCH_STORIES_INCREMENTAL_SUCCESS =
  "FETCH_STORIES_INCREMENTAL_SUCCESS";
export const FETCH_STORIES_NEXT_PAGE = "FETCH_STORIES_NEXT_PAGE";
export const FETCH_STORIES_PER_PAGE = 20;

export const FETCH_CATEGORIES_LOADING = "FETCH_CATEGORIES_LOADING";
export const FETCH_CATEGORIES_ERROR = "FETCH_CATEGORIES_ERROR";
export const FETCH_CATEGORIES_SUCCESS = "FETCH_CATEGORIES_SUCjCESS";

export const FETCH_TAGS_LOADING = "FETCH_TAGS_LOADING";
export const FETCH_TAGS_ERROR = "FETCH_TAGS_ERROR";
export const FETCH_TAGS_SUCCESS = "FETCH_TAGS_SUCCESS";

export const FETCH_AUTHORS_LOADING = "FETCH_AUTHORS_LOADING";
export const FETCH_AUTHORS_ERROR = "FETCH_AUTHORS_ERROR";
export const FETCH_AUTHORS_SUCCESS = "FETCH_AUTHORS_SUCCESS";

export const fetchStoriesInitial =
  (params: SearchStoryParams) => async (dispatch) => {
    dispatch({ type: FETCH_STORIES_LOADING_INITIAL });
    _fetchStories(params, FETCH_STORIES_PER_PAGE, 1, dispatch);
  };

export const fetchStoriesIncremental =
  (params: SearchStoryParams) => async (dispatch, getState) => {
    let state = getState();
    if (state.storyList.status === FETCH_STORIES_LOADING) {
      return
    }
    let totalStory = state.storyList.stories.length;
    let page = Math.floor(totalStory / FETCH_STORIES_PER_PAGE) + 1;
    _fetchStories(params, FETCH_STORIES_PER_PAGE, page, dispatch);
  };

export const _fetchStories = async (
  params: SearchStoryParams,
  perPage: number,
  page: number,
  dispatch
) => {
  dispatch({ type: FETCH_STORIES_LOADING });
  try {
    let { stories, totalStoriesInDatabase, hasMore } =
      await getStoriesAndTotalStoriesInDatabase({
        ...params,
        perPage,
        page,
      });
    dispatch({
      type:
        page === 1
          ? FETCH_STORIES_INITIAL_SUCCESS
          : FETCH_STORIES_INCREMENTAL_SUCCESS,
      payload: {
        stories,
        totalStoriesInDatabase,
        hasMore,
      },
    });
  } catch (err) {
    dispatch({
      type: FETCH_STORIES_ERROR,
    });
  }
};

export const fetchCategories = () => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORIES_LOADING });
  try {
    // refer to REST/Story for existing fetching limitation.
    let categories = await getCategories();

    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: {
        categories,
      },
    });
  } catch {
    dispatch({
      type: FETCH_CATEGORIES_ERROR,
    });
  }
};

export const fetchTags = () => async (dispatch) => {
  dispatch({ type: FETCH_TAGS_LOADING });
  try {
    // refer to REST/Story for existing fetching limitation.
    let tags = await getTags();

    dispatch({
      type: FETCH_TAGS_SUCCESS,
      payload: {
        tags,
      },
    });
  } catch {
    dispatch({
      type: FETCH_TAGS_ERROR,
    });
  }
};

export const fetchAuthors = () => async (dispatch) => {
  dispatch({ type: FETCH_AUTHORS_LOADING });
  try {
    // refer to REST/Story for existing fetching limitation.
    let authors = await getAuthors();

    dispatch({
      type: FETCH_AUTHORS_SUCCESS,
      payload: {
        authors,
      },
    });
  } catch {
    dispatch({
      type: FETCH_AUTHORS_ERROR,
    });
  }
};
