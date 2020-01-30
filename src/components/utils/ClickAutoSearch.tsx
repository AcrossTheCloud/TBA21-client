import { API } from 'aws-amplify';

export const ClickAutoSearch = (searchValue: string, searchField: string) => async () => {
    if (searchValue && searchField) {
        console.log(searchValue, searchField, 'search');
        try {
                const response = await API.post('tba21', 'pages/search', {
                    body: {
                        criteria: [{'field': searchField, 'value': searchValue}],
                        limit: 50,
                        focus_arts: false,
                        focus_action: false,
                        focus_scitech: false
                    }
                });
                console.log(response, 'response');
                // pass response
            } catch (e) {
                // error handling go here
        }
    }

}