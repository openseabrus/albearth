angular.module('albearth', ['rzModule']).controller('albearthCtrl', function ($scope, $http, $window, $timeout) {

    var setFields = function (loggedIn, username, email, picture) {
        $scope.loggedIn = loggedIn ? loggedIn : false;
        $scope.username = username ? username : "";
        $scope.email = email ? email : "";
        $scope.picture = picture ? picture : "";
    }
    setFields();

    $scope.sidenav = "";

    $scope.logon = function (username, email, picture) {
        $scope.loggedIn = true;
        $scope.username = username;
        $scope.email = email;
        $scope.picture = picture;
        var user = {
            "username": username,
            "email": email,
            "picture": picture
        }
        $window.Cookies.set('loggedUser', user);
    }

    $scope.checkCookies = function () {
        var c = $window.Cookies.getJSON('loggedUser');
        if (c) {
            $scope.logon(c["username"], c["email"], c["picture"]);
        }

    }

    $scope.logout = function () {
        $scope.loggedIn = false;
        $scope.picture = "";
        $window.Cookies.remove('loggedUser');
    }

    //##############################
    //####### MAP MANAGEMENT #######
    //##############################

    // loading the page with hidden sidenav causes slider to not render correctly
    // this should fix that
    $scope.refreshSlider = function () {
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        });
    };

    $scope.toggleNav = function () {
        $scope.sidenav = $scope.sidenav ? "" : "open-sidenav";
    }


}).directive('transitionEnd', ['$parse', function ($parse) {
    var transitions = {
        "transition": "transitionend",
        "OTransition": "oTransitionEnd",
        "MozTransition": "transitionend",
        "WebkitTransition": "webkitTransitionEnd"
    };

    var whichTransitionEvent = function () {
        var t,
            el = document.createElement("fakeelement");

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    };

    var transitionEvent = whichTransitionEvent();

    return {
        'restrict': 'A',
        'link': function (scope, element, attrs) {
            var expr = attrs['transitionEnd'];
            var fn = $parse(expr);

            element.bind(transitionEvent, function (evt) {
                console.log('got a css transition event', evt);

                var phase = scope.$root.$$phase;

                if (phase === '$apply' || phase === '$digest') {
                    fn();
                } else {
                    scope.$apply(fn);
                }
            });
        },
    };
}]);