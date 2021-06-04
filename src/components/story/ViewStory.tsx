import React, { useState } from "react";
import { useEffect } from "react";
import "styles/components/story.scss";
import {
  FETCH_STORY_LOADING,
  FETCH_STORY_SUCCESS,
} from "../../actions/story/viewStory";
import { ViewStoryState } from "../../reducers/story/viewStory";
import { connect } from "react-redux";
import { fetchStory } from "../../actions/story/viewStory";
import { Spinner } from "reactstrap";

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
      <span>Stories</span>
      <span>{">"}</span>
      <span>Is this category?</span>
      <span>{">"}</span>
      <span dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
};

const themes = ["light", "dark", "rainbow", "auto"];
const themeToClassName = {
  light: "",
  dark: "story--dark-theme",
  rainbow: "story--rainbow-theme",
};

const ViewStory: React.FC<ViewStoryWithMatch> = ({
  match,
  title,
  html,
  status,
  fetchStory,
}) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("OCEAN_ARCHIVE__THEME") || "light"
  );
  // to trigger theme rerender
  const [ts, setTs] = useState(new Date())

  useEffect(() => {
    fetchStory(match.params.slug);
  }, [fetchStory, match.params.slug]);

  useEffect(() => {
    let media =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

    function mediaChangeListener() {
      setTs(new Date())
    };

    if (media && theme === "auto") {
      media.addEventListener("change", mediaChangeListener);
    }
    return () => {
      media.removeEventListener("change", mediaChangeListener)
    }
  }, [theme, ts]);

  const themeClassName =
    theme === "auto"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? themeToClassName["dark"]
        : themeToClassName["light"]
      : themeToClassName[theme];
  return (
    <div className={`story ${themeClassName}`}>
      <ul>
        {themes.map((t) => (
          <li
            style={{
              fontWeight: theme === t ? "bold" : "normal",
              display: "inline-block",
              marginRight: "1rem",
            }}
            key={t}
            onClick={() => {
              setTheme(t);
              localStorage.setItem("OCEAN_ARCHIVE__THEME", t);
            }}
          >
            {t}
          </li>
        ))}
      </ul>
      {status === FETCH_STORY_LOADING && (
        <div className="story-spinner-wrapper">
          <Spinner />
        </div>
      )}
      {status === FETCH_STORY_SUCCESS && (
        <>
          <ViewStoryBreadcrumb title={title} />
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
