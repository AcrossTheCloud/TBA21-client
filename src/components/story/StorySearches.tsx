import React, { useCallback, useEffect, useState } from "react";
import { StoryListState } from "../../reducers/story/storyList";
import { connect } from "react-redux";
import {
  fetchCategories,
  fetchStories,
  FETCH_STORIES_SUCCESS,
} from "../../actions/story/storyList";
import { SearchStoryParams } from "../../REST/story";
import { debounce } from "lodash";
import { WP_REST_API_Term } from 'wp-types';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

type StorySearchesProps = {
  query: SearchStoryParams | null;
  totalStories: number;
  totalStoriesInDatabase: number;
  status: StoryListState["status"];
  fetchStories: Function;
  fetchCategories: Function;
  parentToChildCategory: StoryListState["parentToChildCategory"];
  categoryById: StoryListState['categoryById'];
};

const StorySearches: React.FC<StorySearchesProps> = ({
  totalStories,
  totalStoriesInDatabase,
  fetchStories,
  fetchCategories,
  status,
  parentToChildCategory,
  categoryById
}) => {
  const [title, setTitle] = useState("");
  const [orderBy, setOrderBy] = useState("date");
  const [orderAuthor, setOrderAuthor] = useState("asc");
  const [orderTitle, setOrderTitle] = useState("asc");
  const [categories, setCategories] = useState<Set<number>>(new Set());
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
    debouncedFetchStories({ title, order, orderBy, categoryIds: Array.from(categories) });
  }, [
    title,
    orderAuthor,
    orderTitle,
    orderBy,
    fetchStories,
    debouncedFetchStories,
    categories,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="stories__searches">
      <div className="stories__header"></div>
      <p
        style={{
          opacity: status === FETCH_STORIES_SUCCESS ? 1 : 0.4,
        }}
      >{`Displaying ${totalStories} out of ${totalStoriesInDatabase} stories`}</p>
      <input
        type="text"
        placeholder="Search stories"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="autocomplete">Search by author</div>
      {parentToChildCategory.map((parentCategory) => (
        <div className="autocomplete" key={parentCategory.id}>
          <UncontrolledDropdown>
            <DropdownToggle nav caret>
              {`Search by ${parentCategory.name}`}
            </DropdownToggle>
            <DropdownMenu style={{maxHeight: '28rem', overflowY: 'scroll'}}>
              {parentCategory.categories.map((category) => (
                <DropdownItem key={category.id} onClick={() => {
                  let newSet = new Set(categories)
                  newSet.has(category.id) ? newSet.delete(category.id) : newSet.add(category.id)
                  setCategories(newSet)
                }}>
                  <div dangerouslySetInnerHTML={{ __html: category.name }} />
                  <div style={{ opacity: 0.6 }}>{category.count} stories</div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      ))}
      <div className="categories-wrapper">
      {Array.from(categories).map(categoryId => {
        let category: WP_REST_API_Term = categoryById[categoryId]
        return <span className='category-tag' key={categoryId}>
          <span>{category.name}</span>
          <span onClick={() => {
            let newSet = new Set(categories)
            newSet.delete(categoryId)
            setCategories(newSet)
          }}>x</span>
        </span>
      })}
      </div>
      <div className="orderby">
        <p>View stories by:</p>
        {ORDER_BY.map(({ label, value }) => (
          <div className="radio-wrapper" key={value}>
            <input
              type="radio"
              id={value}
              name="orderby"
              value={value}
              checked={value === orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            />
            <label htmlFor={value}>{label}</label>
            {value === "author" && (
              <UncontrolledDropdown
                direction={orderAuthor === "asc" ? "down" : "up"}
              >
                <DropdownToggle nav caret>
                  {orderAuthor === "asc" ? "A-Z" : "Z-A"}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => setOrderAuthor("asc")}>
                    Ascending (A-Z)
                  </DropdownItem>
                  <DropdownItem onClick={() => setOrderAuthor("desc")}>
                    Descending (Z-A)
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )}
            {value === "title" && (
              <UncontrolledDropdown
                direction={orderTitle === "asc" ? "down" : "up"}
              >
                <DropdownToggle nav caret>
                  {orderTitle === "asc" ? "A-Z" : "Z-A"}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => setOrderTitle("asc")}>
                    Ascending (A-Z)
                  </DropdownItem>
                  <DropdownItem onClick={() => setOrderTitle("desc")}>
                    Descending (Z-A)
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ORDER_BY = [
  { value: "date", label: "Newest" },
  { value: "author", label: "Author" },
  { value: "title", label: "Title" },
];

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  categoryById: state.storyList.categoryById,
  totalStories: state.storyList.stories.length,
  totalStoriesInDatabase: state.storyList.totalStoriesInDatabase,
  query: state.storyList.query,
  status: state.storyList.status,
  parentToChildCategory: state.storyList.parentToChildCategory,
});

export default connect(mapStateToProps, {
  fetchStories,
  fetchCategories,
})(StorySearches);
