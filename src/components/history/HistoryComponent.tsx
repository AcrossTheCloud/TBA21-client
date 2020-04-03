import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { clearHistory, fetchHistory } from '../../actions/history';
import { HistoryState } from '../../reducers/history';
import { Collection } from '../../types/Collection';
import { Item } from '../../types/Item';
import 'styles/components/historyComponent.scss';
import { openModal } from '../../actions/map/map';
import { FaChevronRight } from 'react-icons/fa';
import { toggle as toggleCollectionModal } from '../../actions/modals/collectionModal';
import { toggle as toggleItemModal } from '../../actions/modals/itemModal';

interface Props {
    fetchHistory: Function;
    clearHistory: Function;
    toggleCollectionModal: Function;
    toggleItemModal: Function;
    openModal: Function;
    history?: HistoryState;
}

interface State {
    history?: HistoryState;
}

class HistoryComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            history: {
                entities: []
            }
        };

        this.props.fetchHistory();
    }

    componentDidUpdate(): void {
        if (
            this.props.history &&
            this.props.history.entities &&
            this.state.history &&
            this.state.history.entities &&
            JSON.stringify(this.props.history.entities) !== JSON.stringify(this.state.history.entities)
        ) {
            this.setState(
                {
                    history: {
                        ...this.state.history,
                        entities: [
                            ...this.props.history.entities
                        ]
                    }
                }
            );
        }
    }

    render() {
        return (
            <div className={'history'} role={'list'}>
                {this.state.history ?
                    this.state.history.entities ?
                        this.state.history.entities.map((entity: Item | Collection, i: number) => (
                            <div
                                key={entity.id}
                                className={'historyEntity'}
                                onClick={() => this.toggleEntity(entity)}
                            >
                                <div className={'historyEntityTitle'}>
                                    <div className={'historyEntityIcon'}>
                                        {entity.__typename === 'collection' ?
                                            (
                                                entity.collections && entity.collections.length ?
                                                (
                                                    <svg
                                                        className="collections_in_collection_icon"
                                                        viewBox="-18 0 40 20"
                                                        version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                                    >
                                                    <g stroke="none" strokeWidth="1" fill="#fff">
                                                      <g id="Circle1">
                                                        <circle cx="15.5" cy="15.5" r="3.5"/>
                                                      </g>
                                                      <g id="Circle2">
                                                        <circle cx="-8.5" cy="15.5" r="3.5"/>
                                                      </g>
                                                      <g id="Circle3">
                                                        <circle cx="3.5" cy="3.5" r="3.5"/>
                                                      </g>
                                                      <g id="Circle4">
                                                        <circle cx="3.5" cy="15.5" r="3.5"/>
                                                      </g>
                                                      <g id="Line1">
                                                        <rect x="3" y="3.5" width="1" height="12"/>
                                                      </g>
                                                      <g id="Line2">
                                                        <rect x="3" y="3.5" width="1" height="17" transform="rotate(-45 3 3.5)"/>
                                                      </g>
                                                      <g id="Line3">
                                                        <rect x="3" y="3.5" width="1" height="17" transform="rotate(45 3 3.5)"/>
                                                      </g>
                                                    </g>
                                                    </svg>
                                                  )
                                                  :
                                                  (
                                                      <svg
                                                        className="collection_icon"
                                                        viewBox="-17 5 40 20"
                                                        version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                                      >
                                                        <g stroke="none" strokeWidth="1" fill="#fff">
                                                          <rect id="Rectangle" x="-6" y="15" width="19" height="1"/>
                                                          <circle id="Oval" cx="15.5" cy="15.5" r="3.5"/>
                                                          <circle id="Oval-Copy-2" cx="3.5" cy="15.5" r="2.5"/>
                                                          <circle id="Oval-Copy" cx="-8.5" cy="15.5" r="3.5"/>
                                                        </g>
                                                      </svg>
                                                  )
                                            ) :
                                            <></>
                                        }
                                    </div>
                                    {entity.title}
                                </div>
                                <div className={'historyEntityArrow'}>
                                    {this.state.history &&
                                    this.state.history.entities &&
                                    i !== (this.state.history.entities.length - 1) ?
                                        <FaChevronRight/> :
                                        <></>
                                    }
                                </div>
                            </div>
                        )) :
                        <></> :
                    <></>
                }
            </div>
        );
    }

    private toggleEntity(entity: Item | Collection) {
        this.props.clearHistory();
        this.props.toggleCollectionModal(false);

        this.props.toggleItemModal(false);
        if (entity.__typename === 'collection') {
            this.props.toggleCollectionModal(true, entity);
        } else if (entity.__typename === 'item') {
            this.props.toggleItemModal(true, entity);
        }
    }
}

const mapStateToProps = (state: State) => ({
    history: state.history
});

export default connect(mapStateToProps, {
    fetchHistory,
    clearHistory,
    toggleCollectionModal,
    toggleItemModal,
    openModal
})(HistoryComponent);
