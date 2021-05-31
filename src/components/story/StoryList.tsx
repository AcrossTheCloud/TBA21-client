import React from "react";
import { useEffect } from "react";
import "styles/components/story.scss";
import StoryItem from "./StoryItem";
import { StoryListState } from "reducers/story/storyList";
import { connect } from "react-redux";
import {
  fetchStories,
  FETCH_STORIES_LOADING,
  FETCH_STORIES_SUCCESS,
} from "../../actions/story/storyList";
import { Spinner } from "reactstrap";

type StoryListProps = {
  fetchStories: Function;
} & StoryListState;

// TODO: fetch author, category, and tag into redux and map it together with selector
const StoryList: React.FC<StoryListProps> = ({
  fetchStories,
  stories,
  status,
}) => {
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  return (
    <div className="stories__list">
      <div className="stories__header">
        <h1 className="stories-headline">~ Dive into stories</h1>
      </div>
      {status === FETCH_STORIES_LOADING && (
        <div className="story-spinner-wrapper">
          <Spinner />
        </div>
      )}
      {status === FETCH_STORIES_SUCCESS &&
        stories.map((story) => {
          let authors = story._embedded?.author as
            | { name: string }[]
            | undefined;
          let authorName = authors?.length ? authors[0].name : "";
          let [categoriesTerm, tagsTerm] = (
            story._embedded ? story._embedded["wp:term"] : [[], []]
          ) as [{ slug: string }[], { slug: string }[]];
          let categories = categoriesTerm.map((cat) => cat.slug);
          let tags = tagsTerm.map((tag) => tag.slug);
          return (
            <StoryItem
              key={story.id}
              slug={story.slug}
              title={story.title.rendered}
              author={authorName}
              body={story.excerpt.rendered}
              date={story.date}
              categories={categories}
              tags={tags}
              imageURL={
                "https://blog.nature.org/science/files/2020/09/JustinBruhn.2_6.1.18.jpg"
              }
            ></StoryItem>
          );
        })}
    </div>
  );
};

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  ...state.storyList,
});
export default connect(mapStateToProps, {
  fetchStories,
})(StoryList);
