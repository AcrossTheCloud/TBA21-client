import * as React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';

import 'styles/components/_reactTags.scss';

// Set up delimiters for tag entry
const KeyCodes = {
  comma: 188,
  enter: 13,
};
const delimiters = [KeyCodes.comma, KeyCodes.enter];

interface Props {
  tags: Tag[];
  suggestions?: Tag[];
}
interface State {
  tags: Tag[];
  suggestions: Tag[];
}

export interface Tag {
  id: string;
  text: string;
}

export default class Tags extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tags: this.props.tags || [],
      suggestions: this.props.suggestions || []
    };

    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  handleDelete(tagIndex: number) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag: Tag, index: number) => index !== tagIndex),
    });
  }

  handleAddition(tag: Tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleDrag(tag: Tag, currPos: number, newPos: number) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  render() {
    const { tags, suggestions } = this.state;
    return (
      <>
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          delimiters={delimiters}
          handleDelete={this.handleDelete}
          handleAddition={this.handleAddition}
          handleDrag={this.handleDrag}
        />
      </>
    );
  }
}
