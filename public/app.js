
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
      controllerAs: 'tc',
    });

    $routeProvider.when('/timer/:id',{
      templateUrl: 'timer.html',
      controller: 'TimerCtrl',
      controllerAs: 'vm',
      resolve: {
        task : function($route, taskService){
          return taskService.getTask($route.current.params.id);
        }
      }
    });

    $routeProvider.otherwise({redirectTo:'/'});

    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('lime')
      .warnPalette('pink')
      .dark();
  }

  //task service
  angular.module('focus').factory('taskService', taskService);

  taskService.$inject = ['$log','$q'];

  function taskService($log,$q){

    var service = {
      getTasks: getTasks,
      getTask: getTask,
      createTask: createTask,
      updateTask: updateTask,
      deleteTask: deleteTask
    };

    return service;

    ///

    function getTasks(){

        var deferred = $q.defer();
        db.all('SELECT * FROM tasks ORDER BY title', function(err, rows) {
          if(err !== null) {
            $log.log(err);
            deferred.reject(err);
          }
          else {
            $log.log(rows);
            deferred.resolve(rows);
          }
        });
        return deferred.promise;
    }

    function getTask(id){
        var deferred = $q.defer();
        db.get('SELECT * FROM tasks where id = ?', [id], function(err, rows) {
          if(err !== null) {
            $log.log(err);
            deferred.reject(err);
          }
          else {
            $log.log(rows);
            deferred.resolve(rows);
          }
        });
        return deferred.promise;

    }

    function createTask(task){

      var deferred = $q.defer();

      sqlRequest = "INSERT INTO tasks (title,description,estimate) VALUES (?,?,?)";

      db.run(sqlRequest,[task.title,task.description,task.estimate], function(err) {
        if(err !== null) {
          $log.log(err);
          deferred.reject(err);
        }
        else {
          deferred.resolve({result: "success"});
          $log.log('inserted');
        }
      });

    }

    function updateTask(task){

      var deferred = $q.defer();
      var sql = "Update tasks set title = ?, description = ?, estimate = ? where id = ?";
       db.run(sql,[task.title,task.description,task.estimate,task.id],
         function(err) {
          if(err !== null) {
            $log.log(err);
            deferred.reject(err);
          }
          else {
            deferred.resolve({result : 'success'});
          }
        });

       return deferred.promise;
    }

    function deleteTask(id){
      var deferred = $q.defer();


       db.run("DELETE FROM tasks WHERE id = " + id,
         function(err) {
          if(err !== null) {
            $log.log(err);
            deferred.reject(err);
          }
          else {
            deferred.resolve({result : 'success'});
          }
        });

       return deferred.promise;

    }

  }

  //timer controller
  angular.module('focus').controller('TimerCtrl',TimerCtrl);

  //task dependency is rosolved during routing
  TimerCtrl.$inject = ['$scope', '$interval','$log','$location','$routeParams','taskService','task'];

  function TimerCtrl($scope,$interval,$log,$location,$routeParams,taskService, task){
    self = this;
    self.timeoutPromise = null;
    self.task = {};
    var log = $log;

    activate();


    function activate(){
      return taskService.getTask($routeParams.id).then(function(data){
          self.task = data;
          return data;
      });

    }

    $log.log(task);

    self.showTasks = function(){
      $location.url("/");
    };


    self.loadTask = function(){
      taskService.getTask();
    };

    self.start = function(){
      $log.log('start');
      self.timeoutPromise = $interval(self.updateDisplay, 1000);
    };

    self.stop = function(){
      $log.log('stop');
      self.timeoutPromise = $interval.cancel(self.timeoutPromise);
    };

    self.reset = function(){
      $log.log('reset');
      self.elapsed = 0;
    };

    self.elapsed = 0;
    self.updateDisplay = function(){
      self.elapsed++;
      $log.log(self.elapsed);
    };
  }

  //timer controller
  angular.module('focus').controller('TaskCtrl',TaskCtrl);

  TaskCtrl.$inject = ['$scope', '$log','taskService','$mdDialog', '$location'];

  function TaskCtrl($scope,$log,taskService,$mdDialog, $location){

    var self = this;
    self.tasks = null;

    self.getTasks = function(){
      taskService.getTasks().then(function(tasks){
        self.tasks = tasks;
      });
    };

    self.saveTask = function(task){
      if(!task.id)
        taskService.createTask(task);
      else
        taskService.updateTask(task);
      self.getTasks();
    };

    self.deleteTask = function(task){
      taskService.deleteTask(task.id);
      self.getTasks();
    };

    self.showTimer= function(ev, task){
      $location.url("/timer/" + task.id);
      // $mdDialog.show({
      //   controller:DialogController,
      //   templateUrl: 'dialog1.tmpl.html',
      //   parent:angular.element(document.body),
      //   targetEvent:ev,
      //   clickOutsideToClose:true,
      //   locals: {
      //     task : task
      //   }
      // }).then(function(task){
      //   self.saveTask(task);
      // });

    };

    self.getTasks();

  }

  function DialogController($scope, $mdDialog, task) {
    $scope.task = task;

    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.saveTask = function() {
      $mdDialog.hide($scope.task);
    };
  }



})();