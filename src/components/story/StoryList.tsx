import React from "react";
import "styles/components/story.scss";
import StoryItem from "./StoryItem";
import { StoryListState } from "reducers/story/storyList";
import { connect } from "react-redux";
import {
  FETCH_STORIES_SUCCESS,
  FETCH_STORIES_LOADING,
} from "../../actions/story/storyList";
import { Spinner } from "reactstrap";
import defaultImage from "images/defaults/Unscharfe_Zeitung.jpg";
type StoryListProps = StoryListState &  {setSelectedCategoryIds: Function, setSelectedTagIds: Function};

export type WP_REST_API_EmbeddedTerm = { id: number, name: string, slug: string }
export type WP_REST_API_EmbeddedTerms = WP_REST_API_EmbeddedTerm[]

const StoryList: React.FC<StoryListProps> = ({ stories, status, setSelectedCategoryIds, setSelectedTagIds }) => {
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
      {status === FETCH_STORIES_SUCCESS && stories.length === 0 && (
        <p>No stories found</p>
      )}
      {status === FETCH_STORIES_SUCCESS &&
        stories.length > 0 &&
        stories.map((story) => {
          let authors = story._embedded?.author as
            | { name: string }[]
            | undefined;
          let authorName = authors?.length ? authors[0].name : "";
          let [categoriesTerm, tagsTerm] = (
            story._embedded ? story._embedded["wp:term"] : [[], []]
          ) as [WP_REST_API_EmbeddedTerms, WP_REST_API_EmbeddedTerms];
          return (
            <StoryItem
              key={story.id}
              slug={story.slug}
              title={story.title.rendered}
              author={authorName}
              body={story.excerpt.rendered}
              date={story.date}
              categories={categoriesTerm}
              tags={tagsTerm}
              imageURL={ story.jetpack_featured_media_url as string ||
                defaultImage
              }
              setSelectedCategoryIds={setSelectedCategoryIds}
              setSelectedTagIds={setSelectedTagIds}
            ></StoryItem>
          );
        })}
    </div>
  );
};

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  ...state.storyList,
});
export default connect(mapStateToProps, {})(StoryList);
