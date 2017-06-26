// let app = angular.module('Vidzy', ['ngResource', 'ngRoute']);
//
// app.config(['$routeProvider', function ($routeProvider) {
//     $routeProvider
//         .when('/', {
//             templateUrl: 'partials/index.html',
//             controller: 'HomeCtrl'
//         })
//         .when('/add-video', {
//             templateUrl: 'partials/video-form.html',
//             controller: 'AddVideoCtrl'
//         })
//         .when('/video/:id', {
//             templateUrl: 'partials/video-form.html',
//             controller: 'EditVideoCtrl'
//         })
//         .otherwise({
//             redirectTo: '/'
//         });
// }]);
//
// app.controller('HomeCtrl', ['$scope', '$resource', function ($scope, $resource) {
//     let videos = $resource('/api/videos');
//     videos.query(function (vids) {
//         $scope.videos = vids;
//     });
// }]);
//
// app.controller('AddVideoCtrl', ['$scope', '$resource', '$location',
//     function($scope, $resource, $location){
//         $scope.save = function(){
//             let Videos = $resource('/api/videos');
//             Videos.save($scope.video, function(){
//                 $location.path('/');
//             });
//         };
//     }
// ]);
//
// app.controller('EditVideoCtrl', ['$scope', '$resource', '$location', '$routeParams',
//     function ($scope, $resource, $location, $routeParams) {
//         let videos = $resource('/api/videos/:id', {id: '@_id'}, {
//             update: {method: 'PUT'}
//         });
//
//         videos.get({id: $routeParams.id}, function (video) {
//             $scope.video = video;
//         });
//
//         $scope.save = function () {
//             videos.update($scope.video, function () {
//                 $location.path('/');
//             });
//         }
//     }
// ]);