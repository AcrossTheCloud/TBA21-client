import React from "react";
import { useEffect } from "react";
import "styles/components/story.scss";
import {
  FETCH_STORY_LOADING,
  FETCH_STORY_SUCCESS,
} from "../../actions/story/viewStory";
import { ViewStoryState } from "../../reducers/story/viewStory";
import { connect } from "react-redux";
import { fetchStory } from "../../actions/story/viewStory";
import { Spinner, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import useStoryTheme from "hooks/useStoryTheme";
import { NavLink } from "react-router-dom";

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
};
const ViewStoryBreadcrumb = ({ title }) => {
  return (
    <div className="story-breadcrumb">
      <span>Ocean Archives</span>
      <span>{">"}</span>
      <NavLink to='/stories'>Stories</NavLink>
      <span>{">"}</span>
      <span dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
};

const ViewStoryHeader = (props) => <div className="story-header" {...props} />;

const ViewStory: React.FC<ViewStoryWithMatch> = ({
  match,
  title,
  html,
  status,
  fetchStory,
}) => {
  const { theme, setTheme, themes, themeClassName } = useStoryTheme();

  useEffect(() => {
    fetchStory(match.params.slug);
  }, [fetchStory, match.params.slug]);

  return (
    <div className={`story ${themeClassName}`}>
      {status === FETCH_STORY_LOADING && (
        <div className="story-spinner-wrapper">
          <Spinner />
        </div>
      )}
      {status === FETCH_STORY_SUCCESS && (
        <>
          <ViewStoryHeader>
            <ViewStoryBreadcrumb title={title} />
            <div>
            <UncontrolledDropdown>
              <DropdownToggle />
              <DropdownMenu right={true}>
              {themes.map((t) => (
                <DropdownItem
                  style={{
                    fontWeight: theme === t ? "bold" : "normal",
                    display: "inline-block",
                    marginRight: "1rem",
                  }}
                  key={t}
                  onClick={() => {
                    setTheme(t);
                  }}
                >
                  {t}
                </DropdownItem>
              ))}
              </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </ViewStoryHeader>
          <div className="story-content">
            <h1 dangerouslySetInnerHTML={{ __html: title }} />
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </>
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
