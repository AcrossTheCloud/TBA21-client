import React from "react";
import { useEffect } from "react";
import "styles/components/story.scss";
import {
  FETCH_STORY_LOADING,
  FETCH_STORY_SUCCESS,
} from "../../actions/story/viewStory";
import { ViewStoryState } from "../../reducers/story/viewStory";
import { connect } from "react-redux";
import { fetchStory } from '../../actions/story/viewStory';
import { Spinner } from 'reactstrap';

type ViewStory = {
  status: typeof FETCH_STORY_SUCCESS | typeof FETCH_STORY_LOADING;
  title: string;
  html: string;
  
};

type ViewStoryWithMatch = ViewStory & {
  fetchStory: Function;
  match: {
    params: { slug: string };
  };
}


const ViewStory: React.FC<ViewStoryWithMatch> = ({ match, title, html, status, fetchStory }) => {
  useEffect(() => {
    fetchStory(match.params.slug);
  }, [match.params.slug]);
  return (
    <div className="story">
      {status === FETCH_STORY_LOADING && <div className='story-spinner-wrapper'>
        <Spinner />
        </div>}
      {status === FETCH_STORY_SUCCESS && (
        <div className="story-content">
          {<h1>{title}</h1>}
          <div
            className="story-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: { viewStory: ViewStoryState }): ViewStory => ({
  status: state.viewStory.status,
  ...state.viewStory.story,
});

export default connect(mapStateToProps, {
  fetchStory,
})(ViewStory);
