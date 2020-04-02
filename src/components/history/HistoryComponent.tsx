import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchHistory } from '../../actions/history';
import { HistoryState } from '../../reducers/history';
import { Collection } from '../../types/Collection';
import { Item } from '../../types/Item';
import 'styles/components/historyComponent.scss';
import { openModal } from '../../actions/map/map';
import { FaChevronRight } from 'react-icons/fa';
import collectionsInCollections from '../../images/svgs/collections-in-collections-icon.svg';

interface Props {
    fetchHistory: Function;
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
                                                        <img
                                                            src={collectionsInCollections}
                                                            className={'collections_in_collection_icon'}
                                                            alt={'Collections in collection'}
                                                        />
                                                    )
                                                    :
                                                    (
                                                        <svg
                                                            className="collection_icon"
                                                            viewBox="0 0 7 31"
                                                            version="1.1"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                                        >
                                                            <g stroke="none" strokeWidth="1" fill="#fff">
                                                                <rect id="Rectangle" x="3" y="6" width="1" height="19"/>
                                                                <circle id="Oval" cx="3.5" cy="3.5" r="3.5"/>
                                                                <circle id="Oval-Copy-2" cx="3.5" cy="15.5" r="2.5"/>
                                                                <circle id="Oval-Copy" cx="3.5" cy="27.5" r="3.5"/>
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
        this.props.openModal(entity.id, entity.__typename);
    }
}

const mapStateToProps = (state: State) => ({
    history: state.history
});

export default connect(mapStateToProps, {fetchHistory, openModal})(HistoryComponent);
