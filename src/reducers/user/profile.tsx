import { OVERLAY, DELETED_ACCOUNT, DELETE_ACCOUNT_ERROR } from '../../actions/user/profile';

interface State {
  hasError: boolean;
  accountDeleted: boolean;
  deletingAccount: boolean;
}
const initialState: State = {
  hasError: false,
  accountDeleted: false,
  deletingAccount: false,
};

export default (state: State|null = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case DELETED_ACCOUNT:
      return {
        ...state,
        accountDeleted: true
      };
    case OVERLAY:
      return {
        ...initialState,
        deletingAccount: true
      };
    case DELETE_ACCOUNT_ERROR:
      return {
        ...initialState,
        hasError: true,
      };

    default:
      return state;
  }
};
