var app = angular.module("topjs", [])
    .controller("searchController", ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {
        localStorage.clear();
        $rootScope.imported = [];

        $scope.searchFun = function () {       // search through github repositories
            var url = "https://api.github.com/search/repositories?q=" + $scope.searchVal + "&sort=stars&order=desc";

            $http.get(url)
                .then(function (response) {
                    $scope.documents = response.data.items;
                    console.log(response.data.items);
                })
                .catch(function (data) {
                    console.error("Error in retrieving");
                });
        }

        //
        // Check if the repo is already imported
        // return true if imported
        //
        $scope.isDisabled = function (id) {
            if ($rootScope.imported.indexOf(id) === -1) {
                return false;
            } else {
                return true;
            }
        }

        $scope.selectedIndex = 0;
        $scope.readPackages = function ($index, doc, owner, name, id) {  // read package.json

            $rootScope.imported.push(id);
            $scope.selectedIndex = $index;
            packageUrl = "https://raw.githubusercontent.com/" + owner + "/" + name + "/master/package.json"

            $scope.storedItems = [];

            // Get package.json for each individual repo and
            // call setPackages with dependency_name to store and
            //increment the dependency package
            $http.get(packageUrl)
                .then(function (response) {
                    $scope.packages = response.data.devDependencies;
                    for (var key in $scope.packages) {
                        $scope.setPackages(key);}
                })
                .catch(function (data) {
                    //alert to notify if package.json doesn't exist or exists with no dependencies
                    alert("This project does not contain a valid package.json file");
                });
            $scope.listPackages();
        }


        $scope.setPackages = function (key) {  
            var pack = {};
            var count = 1;
            var key;
            if ((key in localStorage)) {
                var val = localStorage.getItem(key)
                count = count + parseInt(val);
            }
            localStorage.setItem(key, count);

        }

        // Get all packages from localStorage,
        // Sort packages based on number of imports
        // push top 10 packages to keyDependencies
        $scope.keyDependencies = [];
        $scope.listPackages = function () {
            var packages = {};
            for (key in localStorage) {
                packages[key] = localStorage.getItem(key);
            }
            sortedPackages = Object.keys(packages).sort(function (a, b) { return packages[a] - packages[b] });
            $scope.keyDependencies = sortedPackages.slice(0, 10);
        }

        // 
        //search through top packages(two-way databinding)
        //
        $scope.searchPack = function (searchValue) { 
            angular.forEach($scope.getPackages, function (value, key) {
                if (key == searchValue) {
                    $scope.results.push({
                        Name: key,
                        Version: value
                    }).$filter(lowercase);
                }
            });
        };
    }]);
