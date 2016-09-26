import { MapProvider } from '../maps/create-map.js';
import { UsersManager } from '../kinvey/users.js';
import { WeatherProvider } from '../weather/get-weather.js';

import { ProfileScreen } from '../profile/profileScreen.js';
import { TemplatesProvider } from '../kinvey/templates.js';

import { geolocation } from '../maps/get-geolocation.js';

const WeatherApp = (() => {
    let users,
        weather,
        maps,
        templates,
        profileScreen;

    class WeatherApp {
        constructor(contentContainerId) {
            maps = new MapProvider();
            users = new UsersManager();
            weather = new WeatherProvider();
            templates = new TemplatesProvider();
            profileScreen = new ProfileScreen();

            this._contentContainer = $(contentContainerId);
            this.__app__ = this.__initializeSammyApp__();
        }

        start() {
            this.__app__.run('#/');
        }

        __initializeSammyApp__() {
            const that = this;

            var sammyApp = Sammy("#content", function () {
                var $content = $("#content"),
                    $weatherInfo = $("#weather");

                this.get("#/", function () {
                    $content.html("<p>Route: #/</p><p>Content: TBD</p>");
                    geolocation.getCurrentGeolocation()
                        .then(console.log)
                        .catch(console.log);
                });

                this.get("#/login", function (context) {
                    if (users.isUserLogged()) {
                        context.redirect('#/');
                        return;
                    }

                    templates.get("login")
                        .then(function (template) {
                            $content.html(template());

                            $("#btn-login").on("click", function () {
                                var logUser = {
                                    username: $('#username').val(),
                                    password: $('#password').val()
                                };

                                users.login(logUser)
                                    .then(function (response) {
                                        context.redirect('#/profile');
                                        document.location.reload(true);
                                    });
                            });
                        });
                });

                this.get("#/register", function (context) {
                    if (users.isUserLogged()) {
                        context.redirect('#/');
                        return;
                    }

                    templates.get("register")
                        .then(function (template) {
                            $content.html(template());

                            $("#btn-register").on("click", function () {
                                var newUser = {
                                    username: $('#new-username').val(),
                                    password: $('#new-username').val()
                                }

                                users.register(newUser)
                                    .then(function (response) {
                                        context.redirect('#/');
                                        document.location.reload(true);
                                    });
                            });
                        });
                });


                this.get('#/profile', function () {
                    startProfileScreen();
                });

                this.get('#/profile/:location/:duration', function (route) {
                    // Display weather location
                    // for params.location
                    // with params.duration
                    const profileScreen = $('#profile-screen');
                    if (profileScreen.length === 0) {
                        startProfileScreen();
                    }

                    let templateName;
                    let duration = Number(route.params.duration);
                    if (isNaN(duration)) {
                        duration = 14;
                    }

                    switch (duration) {
                        case 1:
                            templateName = 'current-weather';
                            break;
                        case 5:
                            templateName = 'five-day';
                            break;
                        case 14:
                            templateName = 'fourteen-day';
                            break;
                        default:
                            return;
                    }

                    Promise.all([
                        weather.getForecast(route.params.location, duration),
                        templates.get(templateName)
                    ])
                        .then(([data, template]) => {
                            const generatedHtml = template(data);
                            $("#weather-tiles").html(generatedHtml);
                            return data;
                        })
                        .then(data => {
                            const idSelector = document.getElementById('map-container');
                            idSelector.style.height = (window.innerHeight - 75) + 'px';
                            idSelector.style.width = '100%';

                            maps.initializeMap(
                                data.city.coord.lat,
                                data.city.coord.lon,
                                idSelector
                            );
                        })
                        .then(() => {
                            const cityName = extractCityNameFromCurrentWindowLocation();

                            const container = $(that._contentContainer);
                            container
                                .find('#one-day-forecast')
                                .attr('href', `#/profile/${cityName}/1`);

                            container
                                .find('#five-day-forecast')
                                .attr('href', `#/profile/${cityName}/5`);

                            container
                                .find('#fourteen-day-forecast')
                                .attr('href', `#/profile/${cityName}/14`);

                            console.log(cityName);
                        })
                        .catch(console.log);

                    function extractCityNameFromCurrentWindowLocation() {
                        const windowLocation = String(window.location);
                        const locationElements = windowLocation.split('/');
                        const numberOfElements = locationElements.length;
                        const cityName = locationElements[numberOfElements - 2];

                        return cityName;
                    }
                });

                this.get('#/profile/add', function (route) {
                    const newLocation = $('#input-location').val();
                    if (!newLocation) {
                        return;
                    }

                    users.setUserLocations(newLocation);
                    startProfileScreen();
                    window.location = `#/profile/${newLocation}/1`;
                });

                function startProfileScreen() {
                    profileScreen.start('#content');
                    profileScreen.displayLocationsListForUser('#location-list');
                }
            });

            //logout
            $("#nav-btn-logout").on("click", function () {
                users.logout()
                    .then(function () {
                        location = "#/";
                        document.location.reload(true);
                    });
            });

            return sammyApp;
        }
    }

    return WeatherApp;
})();

export { WeatherApp };