import * as React from "react";
import Clipboard from "react-clipboard.js";

import "styles/utils/share.scss";
import { FaExternalLinkAlt } from "react-icons/fa";

interface State {
  clicked: boolean;
  error?: string;
}

type Props = {
  color?: "dark-gray" | "gray";
  iconComponent?: React.ReactElement;
  text: string;
} & (
  | {
      variant: "prefixedWithHostname";
    }
  | {
      variant: "fullText";
    }
);

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
    switch (this.props.variant) {
      case "prefixedWithHostname":
        return `https://${window.location.hostname}${this.props.text}`;
      case "fullText":
        return this.props.text;
      default:
        console.error("Invalid props on Share component");
        return "";
    }
  }

  render() {
    let color = this.props.color || "gray";
    return (
      <div className={`share share--${color}`}>
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
