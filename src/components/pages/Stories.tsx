import React from "react";
import StoryList from "components/story/StoryList";
import StorySearches from "../story/StorySearches";
import "styles/components/story.scss";

const Stories = () => {
  return (
    <div className="stories">
      <div className="stories__wrapper">
        <StorySearches />
        <StoryList></StoryList>
      </div>
    </div>
  );
};
export default Stories;
