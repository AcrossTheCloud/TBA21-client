import { getStory } from "REST/story";

export const FETCH_STORY_LOADING = "FETCH_STORY_LOADING";
export const FETCH_STORY_ERROR = "FETCH_STORY_ERROR";
export const FETCH_STORY_SUCCESS = "FETCH_STORY_SUCCESS";

export const fetchStory = (slug: string) => async (dispatch, getState) => {
  dispatch({ type: FETCH_STORY_LOADING });
  try {
    let story = await getStory(slug);
    dispatch({
      type: FETCH_STORY_SUCCESS,
      payload: {
        title: story.title.rendered,
        html: story.content.rendered,
      },
    });
  } catch {
    dispatch({
      type: FETCH_STORY_ERROR,
    });
  }
};