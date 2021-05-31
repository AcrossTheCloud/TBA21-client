import {
  FETCH_STORY_LOADING,
  FETCH_STORY_SUCCESS,
} from "../../actions/story/viewStory";

export interface ViewStoryState {
  status: typeof FETCH_STORY_LOADING | typeof FETCH_STORY_SUCCESS,
  story: {
    title: string;
    html: string;
  };
}

const initialState: ViewStoryState = {
  status: FETCH_STORY_LOADING,
  story: {
    title: "",
    html: "",
  },
};

export default (state: ViewStoryState | null = initialState, action) => {
  if (state === undefined) {
    state = initialState;
  }
  switch (action.type) {
    case FETCH_STORY_LOADING:
      return {
        ...state,
        status: FETCH_STORY_LOADING,
      };

    case FETCH_STORY_SUCCESS:
      return {
        ...state,
        status: FETCH_STORY_SUCCESS,
        story: {
          title: action.payload.title,
          html: action.payload.html,
        },
      };

    default:
      return state;
  }
};
