import { groupBy } from "lodash";
import { getCategories, SearchStoryParams } from "REST/story";
import { getStoriesAndTotalStoriesInDatabase } from "../../REST/story";

export const FETCH_STORIES_LOADING = "FETCH_STORIES_LOADING";
export const FETCH_STORIES_ERROR = "FETCH_STORIES_ERROR";
export const FETCH_STORIES_SUCCESS = "FETCH_STORIES_SUCCESS";

export const FETCH_CATEGORIES_LOADING = "FETCH_CATEGORIES_LOADING";
export const FETCH_CATEGORIES_ERROR = "FETCH_CATEGORIES_ERROR";
export const FETCH_CATEGORIES_SUCCESS = "FETCH_CATEGORIES_SUCCESS";

export const fetchStories =
  (params: SearchStoryParams) => async (dispatch, getState) => {
    dispatch({ type: FETCH_STORIES_LOADING });
    try {
      let { stories, totalStoriesInDatabase } =
        await getStoriesAndTotalStoriesInDatabase(params);
      dispatch({
        type: FETCH_STORIES_SUCCESS,
        payload: {
          stories,
          totalStoriesInDatabase,
        },
      });
    } catch {
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
    let groupedByParentId = groupBy(categories, (category) => category.parent);

    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: {
        categoriesByParentId: groupedByParentId
      },
    });
  } catch {
    dispatch({
      type: FETCH_CATEGORIES_ERROR,
    });
  }
};
