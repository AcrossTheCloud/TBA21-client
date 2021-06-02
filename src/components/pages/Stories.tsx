import React from "react";
import StoryList from "components/story/StoryList";
import StorySearches from "../story/StorySearches";
import "styles/components/story.scss";
import { connect } from "react-redux";
import { StoryListState } from "../../reducers/story/storyList";
import { FETCH_STORIES_LOADING, fetchStories } from '../../actions/story/storyList';
import { Spinner } from "reactstrap";
import { useEffect } from 'react';

const Stories = ({isLoading, fetchStories}) => {
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  return (
    <div className="stories">
      {isLoading ? (
        <div className="story-spinner-wrapper">
          <Spinner />
        </div>
      ) : (
        <div className="stories__wrapper">
          <StorySearches />
          <StoryList></StoryList>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  isLoading: state.storyList.status === FETCH_STORIES_LOADING,
});
export default connect(mapStateToProps, {fetchStories})(Stories);
