import { templates } from '../kinvey/templates.js';
import { users } from '../kinvey/users.js';

const profileScreen = (() => {
    function start(container) {
        templates.get('profile-screen')
            .then((template) => {
                const html = template(null);
                $(container).html(html);
            });
    }

    function displayLocationsListForUser(container) {
        Promise.all([
            templates.get('location-list-item'),
            users.getUserLocations()
        ])
            .then(([template, locations]) => {
                const html = template(locations);
                return html;
            })
            .then((html) => {
                $(container).html(html);
            });
    }

    return {
        start,
        displayLocationsListForUser
    };
})();

export { profileScreen };