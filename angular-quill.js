(function loadQuillPlaceholderModule() {
    // Custom module to add placeholder text to Quill editor
    var Placeholder = function(quill, options) {
        this.quill    = quill;
        this.options  = options;
        this.text     = options.text  || "";
        this.style    = options.style || { 'color': '#a9a9a9' };

        var handler   = this.placeholderHandler.bind(this);

        quill.on("selection-change", handler);
        quill.placeholder = this.text;
    };

    Placeholder.prototype.isEmpty = function isEmpty() {
        // NB: We consider a text-editor containing only the placeholder text to be empty 
        var length      = this.quill.getLength(),
            currentText = this.quill.getText(),
            result      = (length === 1) || (currentText === this.text+"\n");
        return result;
    };

    Placeholder.prototype.addPlaceholder = function addPlaceholder() {
        var placeholder = this.text;
        
        this.quill.setText(placeholder + "\n");
        this.quill.formatText(0, placeholder.length, this.style);
    };

    Placeholder.prototype.removePlaceholder = function removePlaceholder() {
        this.quill.setText("\n");
    };

    Placeholder.prototype.placeholderHandler = function placeholderHandler(range) {
        if (!range) {
            // "focus-out"
            if (this.isEmpty()) this.addPlaceholder();
        }
        else {
            // "focus-in"
            if (this.isEmpty()) this.removePlaceholder();
        }
    };

    Placeholder.prototype.initialize = Placeholder.prototype.placeholderHandler;

    Quill.registerModule('placeholder', Placeholder);
})();

(function () {
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
      currentScriptPath = scripts[scripts.length-1].src;

  angular.module('angular-quill', [])
    .directive("quill", ['$timeout', function ($timeout) {
      return {
        restrict: 'A',
        require: "ngModel",
        replace: true,
        templateUrl: currentScriptPath.replace('.js', '.html'),
        controller: function () {

        },
        link: function (scope, element, attrs, ngModel) {

          var updateModel = function updateModel(value) {
              scope.$apply(function () {
                ngModel.$setViewValue(value);
              });
            },
            options = {
              modules: {
                'toolbar': { container: '.toolbar' },
                'image-tooltip': true,
                'link-tooltip': true,
                'placeholder': { text: attrs.placeholder || '' }
              },
              theme: 'snow'
            },
            extraOptions = attrs.quill ?
                                scope.$eval(attrs.quill) : {},
            editor;

          angular.extend(options, extraOptions);
          
          $timeout(function () {

            editor = new Quill(element.children()[1], options);

            ngModel.$render();

            editor.on('text-change', function(delta, source) {
              updateModel(this.getHTML());
            });

            editor.once('selection-change', function(hasFocus) {
              $(editor).toggleClass('focus', hasFocus);
              // Hack for inability to scroll on mobile
              if (/mobile/i.test(navigator.userAgent)) {
                $(editor).css('height', quill.root.scrollHeight + 30)   // 30 for padding
              }
            });

          });


          ngModel.$render = function () {
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

