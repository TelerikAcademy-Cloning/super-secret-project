import { encriptor } from './encriptor.js';

const UsersManager = (function () {
    const AUTH_TOKEN = 'auth-token';
    const USER_NAME = 'user-name';
    const USER_ID = "user-id";
    const USER_FAVOURITE_LOCATIONS = "favourite-locations";

    const APP_ID = "kid_rJYhi_p3";
    const APP_SECRET = "5284c0a9f27b4f7cb2c18cf9e11d7b80";
    const autorizationString = `${APP_ID}:${APP_SECRET}`;

    const sessionUserCredentials = localStorage.getItem(AUTH_TOKEN);

    class UsersManager {
        constructor() {

        }

        register(user) {
            var promise = new Promise(function (resolve, reject) {
                var reqUser = {
                    username: user.username,
                    password: CryptoJS.SHA1(user.password).toString()
                }

                var autorizationHeader = encriptor.encriptToBase64(autorizationString);

                $.ajax({
                    url: `https://baas.kinvey.com/user/${APP_ID}/`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${autorizationHeader}`
                    },
                    data: JSON.stringify(reqUser),
                    contentType: 'application/json',
                    success: function (response) {
                        resolve(response);
                    }
                });
            });

            return promise;
        }

        login(logUser) {
            var promise = new Promise(function (resolve, reject) {
                var reqUser = {
                    username: logUser.username,
                    password: CryptoJS.SHA1(logUser.password).toString()
                };

                var autorizationHeader = encriptor.encriptToBase64(autorizationString);

                $.ajax({
                    url: `https://baas.kinvey.com/user/${APP_ID}/login`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${autorizationHeader}`
                    },
                    data: JSON.stringify(reqUser),
                    contentType: 'application/json',
                    success: function (response) {
                        localStorage.setItem(AUTH_TOKEN, response._kmd.authtoken);
                        localStorage.setItem(USER_NAME, response.username);
                        localStorage.setItem(USER_ID, response._id);

                        resolve(response);
                    }
                });
            });

            return promise;
        };

        logout() {
            var promise = new Promise(function (resolve, reject) {
                localStorage.removeItem(AUTH_TOKEN);
                localStorage.removeItem(USER_NAME);
                localStorage.removeItem(USER_ID);
                localStorage.removeItem(USER_FAVOURITE_LOCATIONS);

                resolve();
            });

            return promise;
        }

        getUserLocations() {
            var promise = new Promise(function (resolve, reject) {

                $.ajax({
                    url: `https://baas.kinvey.com/user/${APP_ID}/${localStorage.getItem(USER_ID)}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Kinvey ${sessionUserCredentials}`
                    },
                    data: JSON.stringify(),
                    contentType: 'application/json',
                    success: function (response) {
                        var locations = response[USER_FAVOURITE_LOCATIONS];

                        if (locations) {
                            locations = locations.split(",");
                        } else {
                            locations = [];
                        }
                        localStorage.setItem(USER_FAVOURITE_LOCATIONS, locations);

                        resolve(locations);
                    }
                });
            });

            return promise;
        }

        setUserLocations(location) {
            var promise = new Promise(function (resolve, reject) {
                var locations = localStorage.getItem(USER_FAVOURITE_LOCATIONS);
                if (!locations) {
                    locations = "";
                }

                if (locations.indexOf(location) === -1) {

                    locations = addLocation(location, locations);

                    var body = {
                        "favourite-locations": locations
                    };

                    $.ajax({
                        url: `https://baas.kinvey.com/user/${APP_ID}/${localStorage.getItem(USER_ID)}`,
                        method: 'PUT',
                        headers: {
                            'Authorization': `Kinvey ${sessionUserCredentials}`
                        },
                        data: JSON.stringify(body),
                        contentType: 'application/json',
                        success: function (response) {
                            localStorage.setItem(USER_FAVOURITE_LOCATIONS, locations);

                            resolve(response);
                        }
                    });
                } else {
                    resolve("Location is already added!");
                }

            });

            return promise;
        }

        isUserLogged() {
            var username = localStorage.getItem(USER_NAME),
                token = localStorage.getItem(AUTH_TOKEN);

            if (username) {
                return {
                    username: username,
                    token: token
                }
            }

            return null;
        }

        addLocation(location, locations) {
            var result = [];

            if (locations) {
                result = locations.split(",");
                result.push(location);
                result = result.join(",");
            } else {
                result = location;
            }

            return result;
        }
    }

    return UsersManager;
} ());

export { UsersManager };