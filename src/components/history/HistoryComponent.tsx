import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchHistory } from '../../actions/history';
import { HistoryState } from '../../reducers/history';
import { Collection } from '../../types/Collection';
import { Item } from '../../types/Item';
import { FileStaticPreview } from '../utils/DetailPreview';
import 'styles/components/historyComponent.scss';
import { openModal } from '../../actions/map/map';

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
            <div className={'history'}>
                <h3>History</h3>
                {this.state.history ?
                    this.state.history.entities ?
                        this.state.history.entities.map((entity: Item | Collection, i: number) => (
                            <div
                                role={'list'}
                                key={entity.id}
                                className={'historyEntity'}
                                onClick={() => this.toggleEntity(entity)}
                            >
                                <div className={'historyEntityBox'}>
                                    {entity.file ?
                                        <FileStaticPreview file={entity.file}/> :
                                        <></>
                                    }
                                    <div className={'historyEntityTitle'}>
                                        {entity.title}
                                    </div>
                                </div>
                                {
                                    this.state.history &&
                                    this.state.history.entities &&
                                    i !== (this.state.history.entities.length - 1) ?
                                        <span className={'historyEntityArrow'}>&rarr;</span> :
                                        <></>
                                }
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
