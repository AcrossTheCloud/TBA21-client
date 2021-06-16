import React, { RefObject } from "react";
import { StoryListState } from "../../reducers/story/storyList";
import { connect } from "react-redux";
import {
  FETCH_STORIES_INITIAL_SUCCESS,
  FETCH_STORIES_INCREMENTAL_SUCCESS,
} from "../../actions/story/storyList";
import { fetchCategories } from "../../actions/story/storyList";
import {
  WP_REST_API_Terms,
  WP_REST_API_Tags,
  WP_REST_API_Users,
} from "wp-types";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

type StorySearchesProps = {
  title: string;
  setTitle: Function;
  selectedCategories: WP_REST_API_Terms;
  setSelectedCategoryIds: Function;
  selectedTags: WP_REST_API_Tags;
  setSelectedTagIds: Function;
  orderBy: "author" | "title" | "date";
  setOrderBy: Function;
  orderTitle: "asc" | "desc";
  orderAuthor: "asc" | "desc";
  setOrderAuthor: Function;
  setOrderTitle: Function;
  totalStories: number;
  totalStoriesInDatabase: number;
  status: StoryListState["status"];
  parentToChildCategory: StoryListState["parentToChildCategory"];
  tags: WP_REST_API_Terms;
  setSelectedAuthorIds: Function;
  authors: WP_REST_API_Users;
  selectedAuthors: WP_REST_API_Users;
  wrapperRef: RefObject<HTMLDivElement>;
  isSticky: boolean;
};

const StorySearches: React.FC<StorySearchesProps> = ({
  wrapperRef,
  title,
  setTitle,
  selectedCategories,
  setSelectedCategoryIds,
  orderBy,
  setOrderBy,
  orderTitle,
  orderAuthor,
  setOrderAuthor,
  setOrderTitle,
  totalStories,
  totalStoriesInDatabase,
  status,
  parentToChildCategory,
  tags,
  setSelectedTagIds,
  selectedTags,
  setSelectedAuthorIds,
  authors,
  selectedAuthors,
  isSticky,
}) => {
  return (
    <div
      className={`stories__searches ${
        isSticky ? "stories__searches--sticky" : ""
      }`}
      ref={wrapperRef}
    >
      <p
        style={{
          opacity:
            status === FETCH_STORIES_INITIAL_SUCCESS ||
            status === FETCH_STORIES_INCREMENTAL_SUCCESS
              ? 1
              : 0.4,
        }}
      >{`Displaying ${totalStories} out of ${totalStoriesInDatabase} stories`}</p>
      <input
        type="text"
        placeholder="Search stories"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="autocomplete">
        <UncontrolledDropdown>
          <DropdownToggle nav caret>
            {`Search by authors`}
          </DropdownToggle>
          <DropdownMenu style={{ maxHeight: "28rem", overflowY: "scroll" }}>
            {authors.map((author) => (
              <DropdownItem
                key={author.id}
                onClick={() => {
                  setSelectedAuthorIds(author.id);
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: author.name }} />
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      <div className="autocomplete">
        <UncontrolledDropdown>
          <DropdownToggle nav caret>
            {`Search by tags`}
          </DropdownToggle>
          <DropdownMenu style={{ maxHeight: "28rem", overflowY: "scroll" }}>
            {Array.from(tags).map((tag) => (
              <DropdownItem
                key={tag.id}
                onClick={() => {
                  setSelectedTagIds(tag.id);
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: tag.name }} />
                <div style={{ opacity: 0.6 }}>{tag.count} stories</div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      {parentToChildCategory.map((parentCategory) => (
        <div className="autocomplete" key={parentCategory.id}>
          <UncontrolledDropdown>
            <DropdownToggle nav caret>
              {`Search by ${parentCategory.name}`}
            </DropdownToggle>
            <DropdownMenu style={{ maxHeight: "28rem", overflowY: "scroll" }}>
              {parentCategory.categories.map((category) => (
                <DropdownItem
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryIds(category.id);
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: category.name }} />
                  <div style={{ opacity: 0.6 }}>{category.count} stories</div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      ))}
      <div className="categories-wrapper">
        {selectedAuthors.map((author) => {
          return (
            <span className="category-tag" key={author.id}>
              <span>{author.name}</span>
              <span
                onClick={() => {
                  setSelectedAuthorIds(author.id);
                }}
              >
                x
              </span>
            </span>
          );
        })}
        {selectedCategories.map((category) => {
          return (
            <span className="category-tag" key={category.id}>
              <span>{category.name}</span>
              <span
                onClick={() => {
                  setSelectedCategoryIds(category.id);
                }}
              >
                x
              </span>
            </span>
          );
        })}
        {selectedTags.map((tag) => {
          return (
            <span className="category-tag" key={tag.id}>
              <span>{tag.name}</span>
              <span
                onClick={() => {
                  setSelectedTagIds(tag.id);
                }}
              >
                x
              </span>
            </span>
          );
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
      <img src="/svg/circular-variant-1.svg" alt="" className='stories__searches__illustration' />
    </div>
  );
};

const ORDER_BY = [
  { value: "date", label: "Newest" },
  { value: "author", label: "Author" },
  { value: "title", label: "Title" },
];

const mapStateToProps = (state: { storyList: StoryListState }) => ({
  totalStories: state.storyList.stories.length,
  totalStoriesInDatabase: state.storyList.totalStoriesInDatabase,
  status: state.storyList.status,
  parentToChildCategory: state.storyList.parentToChildCategory,
  tags: state.storyList.tags,
  authors: state.storyList.authors,
});

export default connect(mapStateToProps, {
  fetchCategories,
})(StorySearches);
