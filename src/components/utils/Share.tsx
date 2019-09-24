import * as React from 'react';
import Clipboard from 'react-clipboard.js';

import 'styles/utils/share.scss';

interface State {
  clicked: boolean;
  error?: string;
}

interface Props {
  suffix: string;
}

export default class Share extends React.Component<Props, State> {
  _isMounted;
  timeout;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;
    this.state = {
      clicked: false
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
    this.timeout = setTimeout( () => {
      clearTimeout(this.timeout);
      if (this._isMounted) {
        this.setState({ clicked: false, error: undefined });
      }
    }, 3000);
  }

  error = () => {
    if (this._isMounted) {
      this.setState({ clicked: false, error: `https://${window.location.hostname}/${this.props.suffix}` });
    }
  }

  render() {
    return (
      <div className="share">
        <div id="shareButton">
          <Clipboard
            data-clipboard-text={`https://${window.location.hostname}/${this.props.suffix}`}
            onSuccess={this.popover}
            onError={this.error}
          >
            {
              this.state.error ?
                this.state.error :
                this.state.clicked ? 'Copied!' : 'Share'
            }
          </Clipboard>
        </div>
      </div>
    );
  }
}
