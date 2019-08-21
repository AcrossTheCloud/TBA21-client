import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Row } from 'reactstrap';
import { debounce } from 'lodash';

import { AuthConsumer } from '../providers/AuthProvider';
import { logoDispatch, loadHomepage, loadMore } from 'actions/home';

import { HomePageState } from '../reducers/home';

import Logo from './layout/Logo';
import 'styles/components/home.scss';

interface Props extends HomePageState {
  logoDispatch: Function;
  loadHomepage: Function;
  loadMore: Function;
  oaHighlights: Function;
}

class HomePage extends React.Component<Props, {}> {
  _isMounted;
  scrollDebounce;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.scrollDebounce = debounce( async () => await this.handleScroll(), 300);
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    window.addEventListener('scroll', this.scrollDebounce, false);

    // If we have no items go get em.
    if (this.props.items && !this.props.items.length) {
      await this.props.loadHomepage();
      await this.props.loadMore(this.props.items, this.props.collections, this.props.loadedItems);
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener('scroll', this.scrollDebounce, false);
  }

  handleScroll = async () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      await this.props.loadMore(this.props.items, this.props.collections, this.props.loadedItems);
    }
  }

  render() {
    return (
      <div id="home" className="flex-fill">
        <section id="header" className="container-fluid">
          <AuthConsumer>
            {({ isAuthenticated, logout }) => (
              isAuthenticated ?
                <Button color="link" onClick={() => logout()}><span className="simple-icon-logout"/> Logout</Button>
                :
                <Button color="link" tag={Link} to="/login"><span className="simple-icon-login"/> Login</Button>
            )}
          </AuthConsumer>

          <Row>
            {this.props.loaded_highlights}
          </Row>
        </section>

        <Logo loaded={this.props.logoLoaded} onChange={() => this.props.logoDispatch(true)}/>

        {this.props.loadedItems}

      </div>
    );
  }
}

const mapStateToProps = (state: { home: Props }) => ({
  logoLoaded: state.home.logoLoaded,

  items: state.home.items,
  collections: state.home.collections,
  oa_highlight: state.home.oa_highlight,
  loadedItems: state.home.loadedItems,
  loaded_highlights: state.home.loaded_highlights
});

export default connect(mapStateToProps, { logoDispatch, loadHomepage, loadMore })(HomePage);
