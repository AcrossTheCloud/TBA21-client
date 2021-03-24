import * as React from "react";
import Clipboard from "react-clipboard.js";

import "styles/utils/share.scss";
import { FaExternalLinkAlt } from "react-icons/fa";

interface State {
  clicked: boolean;
  error?: string;
}

type Props =
  | {
      variant: "prefixedWithHostname";
      text: string;
      iconComponent?: React.ReactElement;
    }
  | {
      variant: "fullText";
      text: string;
      iconComponent?: React.ReactElement;
    };

export default class Share extends React.Component<Props, State> {
  _isMounted;
  timeout;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;
    this.state = {
      clicked: false,
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  popover = () => {
    if (!this.state.clicked && this._isMounted) {
      this.setState({ clicked: true });
    }
    this.timeout = setTimeout(() => {
      clearTimeout(this.timeout);
      if (this._isMounted) {
        this.setState({ clicked: false, error: undefined });
      }
    }, 3000);
  };

  error = () => {
    if (this._isMounted) {
      this.setState({
        clicked: false,
        error: this.generateClipboardText(),
      });
    }
  };

  generateClipboardText() {
    if (this.props.variant == "prefixedWithHostname") {
      return `https://${window.location.hostname}/${this.props.text}`;
    } else if (this.props.variant == "fullText") {
      return this.props.text;
    }
    console.error("Invalid props on Share component");
    return "";
  }

  render() {
    return (
      <div className="share">
        <div id="shareButton">
          <Clipboard
            data-clipboard-text={this.generateClipboardText()}
            onSuccess={this.popover}
            onError={this.error}
          >
            {this.state.error
              ? this.state.error
              : this.state.clicked
              ? "Copied!"
              : this.props.iconComponent || <FaExternalLinkAlt />}
          </Clipboard>
        </div>
      </div>
    );
  }
}
