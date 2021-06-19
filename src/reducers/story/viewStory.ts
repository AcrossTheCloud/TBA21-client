import {
  FETCH_STORY_LOADING,
  FETCH_STORY_SUCCESS,
} from "../../actions/story/viewStory";

export interface ViewStoryState {
  status: typeof FETCH_STORY_LOADING | typeof FETCH_STORY_SUCCESS,
  story: {
    id: number;
    title: string;
    html: string;
  };
}

const initialState: ViewStoryState = {
  status: FETCH_STORY_LOADING,
  story: {
    id: NaN,
    title: "",
    html: "",
  },
};

export default (state: ViewStoryState = initialState, action): ViewStoryState => {
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
          id: action.payload.id,
          title: action.payload.title,
          html: action.payload.html,
        },
      };

    default:
      return state;
  }
};
