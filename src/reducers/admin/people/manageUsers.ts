import { LOAD_MORE, ERROR } from '../../../actions/admin/people/manageUsers';
import { User } from '../../../components/pages/admin/people/ManageUsers';

export interface State {
  errorMessage?: string | undefined;
  users: User[];
  paginationToken?: string;
}
const initialState: State = {
  users: []
};

export default (state: State | undefined = initialState, action) => {
  if (state === undefined) { state = initialState; }

  switch (action.type) {
    case LOAD_MORE:

      let userList: User[] = [];
      if (state.users.length) {
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
