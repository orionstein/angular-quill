(function() {
  'use strict';

  /**
   * usage: <div ng-model="article.body" quill="{
      theme: 'mytheme'
    }"></div>
   *
   *    extra options:
   *      quill: pass as a string
   *
   */


  var scripts = document.getElementsByTagName("script"),
    currentScriptPath = scripts[scripts.length - 1].src;

  angular.module('angular-quill', [])
    .directive("quill", ['$timeout', function($timeout) {
      return {
        restrict: 'A',
        require: "ngModel",
        replace: true,
        templateUrl: 'global/base/layouts/quill/angular-quill.html',
        controller: function() {},
        link: function(scope, element, attrs, ngModel) {

          var updateModel = function updateModel(value) {
              scope.$apply(function() {
                ngModel.$setViewValue(value);
              });
            },
            options = {
              modules: {
                'toolbar': {
                  container: '.toolbar'
                },
                'image-tooltip': true,
                'link-tooltip': true,
                'placeholder': {
                  text: attrs.placeholder || ''
                }
              },
              theme: 'snow'
            },
            extraOptions = attrs.quill ?
              scope.$eval(attrs.quill) : {},
            editor;

          angular.extend(options, extraOptions);

          $timeout(function() {

            editor = new Quill(element.children()[1], options);

            ngModel.$render();

            editor.on('text-change', function(delta, source) {
              updateModel(this.getHTML());
            });

            editor.once('selection-change', function(hasFocus) {
              $(editor).toggleClass('focus', hasFocus);
            });

          });


          ngModel.$render = function() {
            if (angular.isDefined(editor)) {
              $timeout(function() {
                editor.setHTML(ngModel.$viewValue || '');
              });
            }

          };

        }
      };
    }]);
})();
