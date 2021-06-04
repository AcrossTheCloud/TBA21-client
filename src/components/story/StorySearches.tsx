import React, { useCallback, useEffect, useState } from "react";
import { StoryListState } from "../../reducers/story/storyList";
import { connect } from "react-redux";
import {
  fetchStories,
  FETCH_STORIES_SUCCESS,
} from "../../actions/story/storyList";
import { SearchStoryParams } from "../../REST/story";
import { debounce } from "lodash";

type StorySearchesProps = {
  query: SearchStoryParams | null;
  totalStories: number;
  totalStoriesInDatabase: number;
  status: StoryListState["status"];
  fetchStories: Function;
};

const StorySearches: React.FC<StorySearchesProps> = ({
  totalStories,
  totalStoriesInDatabase,
  fetchStories,
  status,
}) => {
  const [title, setTitle] = useState("");

  const debouncedFetchStories = useCallback(debounce((...args) => fetchStories(...args), 250), [])
  useEffect(() => {
    // debounce this
    if (title) {
      debouncedFetchStories({ title });
    } else {
      fetchStories();
    }
  }, [title, fetchStories, debouncedFetchStories]);
  return (
    <div className="stories__searches">
      <div className="stories__header"></div>
      <p
        style={{
          opacity: status === FETCH_STORIES_SUCCESS ? 1 : 0,
        }}
      >{`Displaying ${totalStories} out of ${totalStoriesInDatabase} stories`}</p>
      <input
        type="text"
        placeholder="search stories"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
  );
};

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  totalStories: state.storyList.stories.length,
  totalStoriesInDatabase: state.storyList.totalStoriesInDatabase,
  query: state.storyList.query,
  status: state.storyList.status,
});

export default connect(mapStateToProps, {
  fetchStories,
})(StorySearches);
