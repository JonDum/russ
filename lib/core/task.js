'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var winston = require('winston');
/**
  * @class BoltTask
  * task instance for Bolt.
  *
  * @constructor(parent, opts)
  * @param parent {BoltInstance} - defines task parent to bind to.
  * @param opts {Object} - defines logistics of task such as dependencies
  * pre/post hooks etc.
*/

var BoltTask = function () {
  function BoltTask(parent, opts) {
    _classCallCheck(this, BoltTask);

    /* Assign all opts to task */
    Object.assign(this, opts);
    this.parent = parent;
    /**
      * If the task is dependant on modules and these are declared in the task
      * definition, require each and push into an Array to be used at run time
    */
    this.deps = [];
    if (opts.deps && opts.deps.length) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = opts.deps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var dep = _step.value;

          var _module = void 0;
          try {
            _module = require(dep);
          } catch (err) {
            var path = process.cwd() + '/node_modules/' + dep;
            _module = require(path);
          }
          this.deps.push(_module);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }
  /**
    * runs task
    @return {Promise} - Promise that informs BoltInstance of task outcome.
  */


  _createClass(BoltTask, [{
    key: 'run',
    value: function run() {
      var _this = this;

      /**
        * Returns a Promise so that Bolt knows to start on the next task.
        * Be mindful that a watching task will never resolve so if we wish to run
        * more than one watch, we must use the "concurrent" option.
      */
      return new Promise(function (resolve, reject) {
        /* give user feedback so they know which task is running */
        winston.info('Running ' + _this.name);
        /**
          * profile the running time using winston so user can see which tasks
          * may be underperforming or should be refactored
        */
        winston.profile(_this.name);
        /**
          * run function
          * passing the task dependencies(an Array of required modules) and a
          * reference Object that contains the resolve/reject for the Promise in
          * addition to any configuration defined within .boltrc, environment and
          * the BoltInstance run. "run" is important for when we have a watcher
          * that wishes to run another task or wish to run a task within a task.
        */
        _this.func.apply(_this, _toConsumableArray(_this.deps).concat([{
          __parent: _this.parent,
          env: _this.parent.env,
          config: _this.parent.config,
          resolve: resolve,
          reject: reject,
          run: _this.parent.runTask.bind(_this.parent)
        }]));
      });
    }
  }]);

  return BoltTask;
}();

module.exports = BoltTask;