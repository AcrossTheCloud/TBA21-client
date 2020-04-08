import * as React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { clear, fetch, pushEntity } from '../../actions/user-history';
import { UserHistoryEntity, UserHistoryState } from '../../reducers/user-history';
import { Collection } from '../../types/Collection';
import { Item } from '../../types/Item';
import 'styles/components/userHistoryComponent.scss';
import { openModal } from '../../actions/map/map';
import { FaChevronRight } from 'react-icons/fa';
import { toggle as toggleCollectionModal } from '../../actions/modals/collectionModal';
import { toggle as toggleItemModal } from '../../actions/modals/itemModal';
import _ from 'lodash';

interface Props {
    fetch: Function;
    clear: Function;
    toggleCollectionModal: Function;
    toggleItemModal: Function;
    openModal: Function;
    userHistory: UserHistoryState;
    pushEntity: Function;
}

interface State {
    userHistory: UserHistoryState;
}

class UserHistoryComponent extends PureComponent<Props, State> {
    private static getClassNames(isCurrent: boolean): string {
        return `userHistoryEntity${isCurrent ? ' isCurrent' : ''}`;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            userHistory: {
                entities: [],
                loading: true
            }
        };

        this.props.fetch();
    }

    componentDidUpdate(): void {
        if (_.isEqual(this.props.userHistory, this.state.userHistory)) {
            this.setState(
                {
                    userHistory: {
                        ...this.props.userHistory,
                        entities: [
                            ...this.props.userHistory.entities
                        ],
                        loading: this.props.userHistory.loading
                    }
                }
            );
        }
    }

    render() {
        if (this.props.userHistory.loading) {
            return (<></>);
        }

        return (
            <div className={'userHistory'} role={'list'}>
                {this.state.userHistory.entities ?
                    this.state.userHistory.entities.map((entity: UserHistoryEntity, i: number) => (
                        <div
                            key={entity.id}
                            className={UserHistoryComponent.getClassNames(entity.isCurrent)}
                            onClick={() => this.toggleEntity(entity)}
                        >
                            <div className={'userHistoryEntityTitle'}>
                                {entity.__typename === 'collection' ?
                                    (
                                        entity.collections && entity.collections.length ?
                                            (
                                                <div className={'userHistoryEntityIcon'}>
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
                                                                <rect
                                                                    x="3"
                                                                    y="3.5"
                                                                    width="1"
                                                                    height="17"
                                                                    transform="rotate(-45 3 3.5)"
                                                                />
                                                            </g>
                                                            <g id="Line3">
                                                                <rect
                                                                    x="3"
                                                                    y="3.5"
                                                                    width="1"
                                                                    height="17"
                                                                    transform="rotate(45 3 3.5)"
                                                                />
                                                            </g>
                                                        </g>
                                                    </svg>
                                                </div>
                                            )
                                            :
                                            (
                                                <div className={'userHistoryEntityIcon'}>
                                                    <svg
                                                        className="collection_icon"
                                                        viewBox="-17 5 40 20"
                                                        version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                                    >
                                                        <g stroke="none" strokeWidth="1" fill="#fff">
                                                            <rect
                                                                id="Rectangle"
                                                                x="-6"
                                                                y="15"
                                                                width="19"
                                                                height="1"
                                                            />
                                                            <circle id="Oval" cx="15.5" cy="15.5" r="3.5"/>
                                                            <circle id="Oval-Copy-2" cx="3.5" cy="15.5" r="2.5"/>
                                                            <circle id="Oval-Copy" cx="-8.5" cy="15.5" r="3.5"/>
                                                        </g>
                                                    </svg>
                                                </div>
                                            )
                                    ) :
                                    <></>
                                }
                                {entity.title}
                            </div>
                            <div className={'userHistoryEntityArrow'}>
                                {this.state.userHistory &&
                                this.state.userHistory.entities &&
                                i !== (this.state.userHistory.entities.length - 1) ?
                                    <FaChevronRight/> :
                                    <></>
                                }
                            </div>
                        </div>
                    )) :
                    <></>
                }
            </div>
        );
    }

    private toggleEntity(entity: Item | Collection) {
        this.props.pushEntity(entity);

        if (entity.__typename === 'collection') {
            this.props.toggleCollectionModal(true, entity);
            this.props.toggleItemModal(false);
        } else if (entity.__typename === 'item') {
            this.props.toggleItemModal(true, entity);
            this.props.toggleCollectionModal(false);
        }
    }
}

const mapStateToProps = (state: State) => ({
    userHistory: state.userHistory
});

export default connect(mapStateToProps, {
    fetch,
    clear,
    toggleCollectionModal,
    toggleItemModal,
    openModal,
    pushEntity
})(UserHistoryComponent);
