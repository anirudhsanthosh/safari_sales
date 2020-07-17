cordova.define("cordova-plugin-mock-gps-checker.MockGpsChecker", function(require, exports, module) {
var mockgps = {
  check: function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'MockGpsChecker', 'check', []);
  }
}

cordova.addConstructor(function () {
  if (!window.plugins) {window.plugins = {};}

  window.plugins.mockgpschecker = mockgps;
  return window.plugins.mockgpschecker;
});

});
