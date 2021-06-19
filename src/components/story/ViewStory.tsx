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
import {
  Spinner,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import useStoryTheme from "hooks/useStoryTheme";
import { NavLink } from "react-router-dom";
import { storiesURL } from "urls";
import {
  addUserFavourite,
  deleteUserFavourite,
} from "../../actions/user/profile";
import { ProfileState } from "../../reducers/user/profile";
import { TiStar, TiStarOutline } from "react-icons/ti";

type ViewStory = {
  status: typeof FETCH_STORY_SUCCESS | typeof FETCH_STORY_LOADING;
  favouriteStatus: "LOADING" | "FAVOURITED" | "IDLE";
  title: string;
  html: string;
  id: number;
};

type ViewStoryWithMatch = ViewStory & {
  fetchStory: Function;
  addUserFavourite: Function;
  deleteUserFavourite: Function;
  match: {
    params: { slug: string };
  };
};

type ViewStoryBreadcrumbProps = { title: string };
const ViewStoryBreadcrumb: React.FC<ViewStoryBreadcrumbProps> = ({ title }) => {
  return (
    <div className="story-breadcrumb">
      <span>Ocean Archives</span>
      <span>{">"}</span>
      <NavLink to={storiesURL()}>Stories</NavLink>
      <span>{">"}</span>
      <span dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
};

const ViewStoryHeader = (props) => <div className="story-header" {...props} />;

const ViewStory: React.FC<ViewStoryWithMatch> = ({
  id,
  match,
  title,
  html,
  status,
  fetchStory,
  addUserFavourite,
  deleteUserFavourite,
  favouriteStatus,
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
            <div className='story-header__right'>
            {favouriteStatus === "FAVOURITED" && (
                <TiStar
                  color="yellow"
                  onClick={() => {
                    deleteUserFavourite("stories", id);
                  }}
                />
              )}
              {favouriteStatus === "LOADING" && <Spinner />}
              {favouriteStatus === "IDLE" && (
                <TiStarOutline
                  onClick={() => {
                    addUserFavourite("stories", id);
                  }}
                />
              )}
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

const mapStateToProps = (
  state: { viewStory: ViewStoryState; profile: ProfileState },
  props: ViewStory
): ViewStory => {
  console.log(state.profile);
  const isFavourited = (
    (state.profile &&
      state.profile.details &&
      state.profile.details.favourites &&
      state.profile.details.favourites["stories"]) ||
    []
  ).includes(state.viewStory.story.id)
    ? "FAVOURITED"
    : "IDLE";
  return {
    status: state.viewStory.status,
    ...state.viewStory.story,
    favouriteStatus: state.profile.favouriteIsLoading
      ? "LOADING"
      : isFavourited,
  };
};

export default connect(mapStateToProps, {
  fetchStory,
  addUserFavourite,
  deleteUserFavourite,
})(ViewStory);
