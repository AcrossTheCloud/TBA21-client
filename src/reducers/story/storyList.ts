import { groupBy, keyBy } from "lodash";
import { SearchStoryParams } from "REST/story";
import { WP_REST_API_Posts, WP_REST_API_Term } from "wp-types";
import { FETCH_CATEGORIES_SUCCESS } from "../../actions/story/storyList";
import {
  FETCH_STORIES_LOADING,
  FETCH_STORIES_SUCCESS,
} from "../../actions/story/storyList";

export interface StoryListState {
  status: typeof FETCH_STORIES_LOADING | typeof FETCH_STORIES_SUCCESS;
  stories: WP_REST_API_Posts;
  totalStoriesInDatabase: number;
  query: SearchStoryParams | null;
  parentToChildCategory: (WP_REST_API_Term & {
    categories: WP_REST_API_Term[];
  })[];
  categoryById: { string: WP_REST_API_Term } | {};
}

const initialState: StoryListState = {
  status: FETCH_STORIES_LOADING,
  totalStoriesInDatabase: 0,
  stories: [],
  query: null,
  parentToChildCategory: [],
  categoryById: {},
};

export default (
  state: StoryListState = initialState,
  action
): StoryListState => {
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

    case FETCH_CATEGORIES_SUCCESS:
      let { categories } = action.payload;
      let categoriesByParentId = groupBy(
        categories,
        (category) => category.parent
      );
      let parentCategories = categoriesByParentId[0];
      let parentToChildCategory = parentCategories.map((parentCategory) => ({
        ...parentCategory,
        categories: categoriesByParentId[parentCategory.id] || [],
      }));
      let categoryById = keyBy(categories, (category) => category.id);
      return {
        ...state,
        parentToChildCategory,
        categoryById,
      };

    default:
      return state;
  }
};
