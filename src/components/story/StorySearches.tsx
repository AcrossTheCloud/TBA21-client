import React, { useCallback, useEffect, useState } from "react";
import { StoryListState } from "../../reducers/story/storyList";
import { connect } from "react-redux";
import {
  fetchStories,
  FETCH_STORIES_SUCCESS,
} from "../../actions/story/storyList";
import { SearchStoryParams } from "../../REST/story";
import { debounce } from "lodash";
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
};

const StorySearches: React.FC<StorySearchesProps> = ({
  totalStories,
  totalStoriesInDatabase,
  fetchStories,
  status,
}) => {
  const [title, setTitle] = useState("");

  const [orderBy, setOrderBy] = useState("date");
  const [orderAuthor, setOrderAuthor] = useState("asc");
  const [orderTitle, setOrderTitle] = useState("asc");
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
    debouncedFetchStories({ title, order, orderBy });
  }, [
    title,
    orderAuthor,
    orderTitle,
    orderBy,
    fetchStories,
    debouncedFetchStories,
  ]);
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
      <div className="autocomplete">Search by concept tags</div>
      <div className="autocomplete">Search by keyword tags</div>
      <div className="autocomplete">Search by type</div>
      <div className="autocomplete">Search by geography</div>
      <div className="orderby">
        <p>View stories by:</p>
        {ORDER_BY.map(({ label, value }) => (
          <div className="radio-wrapper">
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
              <UncontrolledDropdown>
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
              <UncontrolledDropdown>
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
  totalStories: state.storyList.stories.length,
  totalStoriesInDatabase: state.storyList.totalStoriesInDatabase,
  query: state.storyList.query,
  status: state.storyList.status,
});

export default connect(mapStateToProps, {
  fetchStories,
})(StorySearches);
