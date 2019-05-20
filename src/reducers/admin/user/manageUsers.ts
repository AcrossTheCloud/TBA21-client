import { LOAD_MORE, ERROR } from '../../../actions/admin/user/manageUsers';
import { User } from 'types/User';

export interface State {
  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
  limit: number;
}
const initialState: State = {
  users: [],
  limit: 15
};

export default (state: State | undefined = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LOAD_MORE:

      let userList: User[] = [];
      if (state.users.length && !action.refresh) {
        userList = [
          ...state.users,
          ...action.users
        ];
      } else {
        userList = action.users;
      }

      return {
        users: userList,
        paginationToken: action.paginationToken,
        limit: action.limit,
        errorMessage: undefined,
      };
    case ERROR:
      return {
        ...state,
        errorMessage: action.error
      };

    default:
      return state;
  }
};
