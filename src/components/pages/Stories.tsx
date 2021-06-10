import React, { useCallback, useEffect, useMemo, useState } from "react";
import StoryList from "components/story/StoryList";
import StorySearches from "../story/StorySearches";
import "styles/components/story.scss";
import { debounce } from "lodash";
import {
  fetchStories,
  fetchCategories,
  fetchTags,
} from "../../actions/story/storyList";
import { connect } from "react-redux";
import { StoryListState } from "../../reducers/story/storyList";
import {
  WP_REST_API_Terms,
  WP_REST_API_Tags,
  WP_REST_API_Users,
} from "wp-types";
import { fetchAuthors } from "../../actions/story/storyList";

type StoriesProps = {
  fetchStories: Function;
  fetchCategories: Function;
  fetchTags: Function;
  fetchAuthors: Function;
  categoryById: StoryListState["categoryById"];
  tagById: StoryListState["tagById"];
  authorById: StoryListState["authorById"];
};

const Stories: React.FC<StoriesProps> = ({
  fetchStories,
  fetchCategories,
  fetchAuthors,
  fetchTags,
  categoryById,
  tagById,
  authorById,
}) => {
  const [title, setTitle] = useState("");
  const [orderBy, setOrderBy] = useState<"author" | "title" | "date">("date");
  const [orderAuthor, setOrderAuthor] = useState<"asc" | "desc">("asc");
  const [orderTitle, setOrderTitle] = useState<"asc" | "desc">("asc");
  const [selectedCategoryIds, _setSelectedCategoryIds] = useState<Set<number>>(
    new Set()
  );
  const [selectedTagIds, _setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedAuthorIds, _setSelectedAuthorIds] = useState<Set<number>>(
    new Set()
  );

  const setSelectedCategoryIds = useCallback(
    (id) => {
      let newSet = new Set(selectedCategoryIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      _setSelectedCategoryIds(newSet);
    },
    [selectedCategoryIds]
  );

  const setSelectedTagIds = useCallback(
    (id) => {
      let newSet = new Set(selectedTagIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      _setSelectedTagIds(newSet);
    },
    [selectedTagIds]
  );

  const setSelectedAuthorIds = useCallback(
    (id) => {
      let newSet = new Set(selectedAuthorIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      _setSelectedAuthorIds(newSet);
    },
    [selectedAuthorIds]
  );

  const debouncedFetchStories = useCallback(
    debounce((...args) => fetchStories(...args), 250),
    []
  );

  useEffect(() => {
    let order =
      orderBy === "author"
        ? orderAuthor
        : orderBy === "title"
        ? orderTitle
        : "desc";

    debouncedFetchStories({
      title,
      order,
      orderBy,
      categoryIds: Array.from(selectedCategoryIds),
      tagIds: Array.from(selectedTagIds),
      authorIds: Array.from(selectedAuthorIds),
    });
  }, [
    title,
    orderAuthor,
    orderTitle,
    orderBy,
    fetchStories,
    debouncedFetchStories,
    selectedCategoryIds,
    selectedTagIds,
    selectedAuthorIds,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchAuthors();
  }, [fetchCategories, fetchTags, fetchAuthors]);

  const selectedCategories: WP_REST_API_Terms = useMemo(() => {
    return Array.from(selectedCategoryIds)
      .filter((cat) => categoryById[cat])
      .map((categoryId) => {
        let category = categoryById[categoryId];
        return category;
      });
  }, [categoryById, selectedCategoryIds]);

  const selectedTags: WP_REST_API_Tags = useMemo(
    () =>
      Array.from(selectedTagIds)
        .filter((tag) => tagById[tag])
        .map((tagId) => {
          return tagById[tagId];
        }),
    [tagById, selectedTagIds]
  );

  const selectedAuthors: WP_REST_API_Users = useMemo(
    () =>
      Array.from(selectedAuthorIds)
        .filter((authorId) => authorById[authorId])
        .map((authorId) => {
          console.log(authorId)
          return authorById[authorId];
        }),
    [authorById, selectedAuthorIds]
  );

  return (
    <div className="stories">
      <div className="stories__wrapper">
        <StorySearches
          title={title}
          setTitle={setTitle}
          selectedCategories={selectedCategories}
          setSelectedCategoryIds={setSelectedCategoryIds}
          selectedTags={selectedTags}
          setSelectedTagIds={setSelectedTagIds}
          selectedAuthors={selectedAuthors}
          setSelectedAuthorIds={setSelectedAuthorIds}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          orderTitle={orderTitle}
          orderAuthor={orderAuthor}
          setOrderAuthor={setOrderAuthor}
          setOrderTitle={setOrderTitle}
        />
        <StoryList
          setSelectedCategoryIds={setSelectedCategoryIds}
          setSelectedTagIds={setSelectedTagIds}
        />
      </div>
    </div>
  );
};

export default connect(
  (state: { storyList: StoryListState }) => ({
    categoryById: state.storyList.categoryById,
    tagById: state.storyList.tagById,
    authorById: state.storyList.authorById,
  }),
  { fetchStories, fetchCategories, fetchTags, fetchAuthors }
)(Stories);
