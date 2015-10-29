
(function(){

  var sqlite3 = require('sqlite3').verbose();

  var db = new sqlite3.Database('tasks.db');

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'",
     function(err, rows) {
      if(err !== null) {
          console.log(err);
      }
      else if(rows === undefined) {
        db.run('CREATE TABLE "tasks" ' +
               '("id" INTEGER PRIMARY KEY AUTOINCREMENT, ' +
               '"title" VARCHAR(255), ' +
               'description VARCHAR(255), ' +
               'estimate INTEGER) ', function(err) {
          if(err !== null) {
            console.log(err);
          }
          else {
            console.log("SQL Table 'tasks' initialized.");
          }
        });
      }
      else {
        console.log("SQL Table 'tasks' already initialized.");
      }
    });

  angular.module('focus',['ngRoute','ngMaterial','ngAnimate']);

  angular.module('focus').config(['$routeProvider',
    '$mdThemingProvider',
    focusConfig]);


  function focusConfig($routeProvider,$mdThemingProvider){
    $routeProvider.when('/',{
      templateUrl: 'task.html',
      controller: 'TaskCtrl',
      controllerAs: 'tc'
    });

    $routeProvider.otherwise({redirectTo:'/'});

    $mdThemingProvider.theme('default').dark();
  }

  //task service
  angular.module('focus').factory('taskService', taskService);

  taskService.$inject = ['$log','$q'];

  function taskService($log,$q){

    var service = {
      getTasks: getTasks,
      createTask: createTask
    };

    return service;

    ///

    function getTasks(){

        var deferred = $q.defer();
        db.all('SELECT * FROM tasks ORDER BY title', function(err, rows) {
          if(err !== null) {
            console.log(err);
            deferred.reject(err);
          }
          else {
            console.log(rows);
            deferred.resolve(rows);
          }
        });
        return deferred.promise;
    }

    function getTask(id){

    }

    function createTask(task){

     sqlRequest = "INSERT INTO 'tasks' (title,description,estimate) " +
               "VALUES('task 1','task descr',3)";

      db.run(sqlRequest, function(err) {
        if(err !== null) {
          next(err);
        }
        else {
          console.log('inserted');
        }
      });

    }

    function updateTask(task){

    }

    function deleteTask(){

    }

  }

  //timer controller
  angular.module('focus').controller('TimerCtrl',TimerCtrl);

  TimerCtrl.$inject = ['$scope', '$interval','$log'];

  function TimerCtrl($scope,$interval,$log){
    vm = this;
    vm.timeoutPromise = null;
    var log = $log;

    vm.start = function(){
      $log.log('start');
      vm.timeoutPromise = $interval(vm.updateDisplay, 1000);
    };

    vm.stop = function(){
      $log.log('stop');
      vm.timeoutPromise = $interval.cancel(vm.timeoutPromise);
    };

    vm.reset = function(){
      $log.log('reset');
      vm.elapsed = 0;
    };

    vm.elapsed = 0;
    vm.updateDisplay = function(){
      vm.elapsed++;
      $log.log(vm.elapsed);
    };
  }

  //timer controller
  angular.module('focus').controller('TaskCtrl',TaskCtrl);

  TaskCtrl.$inject = ['$scope', '$log','taskService'];

  function TaskCtrl($scope,$log,taskService){

    var self = this;
    self.tasks = null;

    self.getTasks = function(){
      taskService.getTasks().then(function(tasks){
        self.tasks = tasks;
      });
    };

    self.createTask = function(task){
      taskService.createTask(task);
    };

    self.getTasks();

  }







})();