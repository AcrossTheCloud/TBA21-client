import React, { useEffect, useRef } from "react";
import "styles/components/story.scss";
import StoryItem from "./StoryItem";
import { StoryListState } from "reducers/story/storyList";
import { connect } from "react-redux";
import {
  FETCH_STORIES_LOADING,
  FETCH_STORIES_ERROR,
} from "../../actions/story/storyList";
import { Spinner } from "reactstrap";
import defaultImage from "images/defaults/Unscharfe_Zeitung.jpg";
import {
  fetchStoriesIncremental,
  FETCH_STORIES_INCREMENTAL_SUCCESS,
  FETCH_STORIES_INITIAL_SUCCESS,
} from "../../actions/story/storyList";
import { debounce } from "lodash";
type StoryListProps = StoryListState & {
  setSelectedCategoryIds: Function;
  setSelectedTagIds: Function;
  fetchStoriesIncremental: Function;
};

export type WP_REST_API_EmbeddedTerm = {
  id: number;
  name: string;
  slug: string;
};
export type WP_REST_API_EmbeddedTerms = WP_REST_API_EmbeddedTerm[];

const StoryList: React.FC<StoryListProps> = ({
  stories,
  status,
  setSelectedCategoryIds,
  setSelectedTagIds,
  hasMore,
  fetchStoriesIncremental,
  authorById,
}) => {
  const scrollStoriesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let scrollElement = scrollStoriesRef.current;

    function scrollHandler() {
      let bounding = scrollElement?.getBoundingClientRect();
      if (bounding && bounding.y - window.innerHeight <= 0) {
        fetchStoriesIncremental();
      }
    }
    const debouncedScrollHandler = debounce(scrollHandler, 200);
    if (hasMore) {
      window.addEventListener("scroll", debouncedScrollHandler);
    }
    return () => window.removeEventListener("scroll", debouncedScrollHandler);
  }, [hasMore, status, fetchStoriesIncremental]);

  let successfullyFetched =
    status === FETCH_STORIES_INCREMENTAL_SUCCESS ||
    status === FETCH_STORIES_INITIAL_SUCCESS;
  return (
    <div className="stories__list">
      <h1 className="stories-headline">~ Dive into stories</h1>
      {successfullyFetched && stories.length === 0 && <p>No stories found</p>}
      {(successfullyFetched || status === FETCH_STORIES_LOADING) &&
        stories.length > 0 &&
        stories.map((story) => {
          let authorName = authorById[story.author]?.full_name || "";
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
              imageURL={
                (story.jetpack_featured_media_url as string) || defaultImage
              }
              setSelectedCategoryIds={setSelectedCategoryIds}
              setSelectedTagIds={setSelectedTagIds}
            />
          );
        })}
      {status === FETCH_STORIES_LOADING && (
        <div
          className={`story-spinner-wrapper ${
            stories.length > 0 ? "story-spinner-wrapper--compact" : ""
          }`}
        >
          <Spinner />
        </div>
      )}
      {status === FETCH_STORIES_ERROR && (
        <div>Something went wrong. Refresh the page.</div>
      )}
      {hasMore && successfullyFetched && (
        <div
          ref={scrollStoriesRef}
          className="trigger-fetch"
          style={{ height: "100px" }}
        ></div>
      )}
      {!hasMore && stories.length > 0 && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          no more story
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  ...state.storyList,
});
export default connect(mapStateToProps, { fetchStoriesIncremental })(StoryList);
