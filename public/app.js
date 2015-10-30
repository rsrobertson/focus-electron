
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
        db.get('SELECT * FROM tasks where id = ? + ORDER BY title', [id], function(err, rows) {
          if(err !== null) {
            $log.log(err);
            deferred.reject(err);
          }
          else {
            $log.log(rows);
            deferred.resolve(row);
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

  TaskCtrl.$inject = ['$scope', '$log','taskService','$mdDialog'];

  function TaskCtrl($scope,$log,taskService,$mdDialog){

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

    self.showEdit = function(ev, task){
      $mdDialog.show({
        controller:DialogController,
        templateUrl: 'dialog1.tmpl.html',
        parent:angular.element(document.body),
        targetEvent:ev,
        clickOutsideToClose:true,
        locals: {
          task : task
        }
      }).then(function(task){
        self.saveTask(task);
      });

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