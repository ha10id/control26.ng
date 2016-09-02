/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).

  directive('newTag', function(){
  return {
    restrict: 'E',
    controller: function($scope, $element){
      var text = $element.text();
      $element.text( text + ' Second' );
    },
    compile: function(element, attributes){
      return {
        pre: function(scope, element, attributes, controller, transcludeFn){
          var text = element.text();
          element.text( text + ' Third' );
        },
        post: function(scope, element, attributes, controller, transcludeFn){
          var text = element.text();
          element.text( text + ' Forth' );
        }
      };
     }
  };
}).
// вспывающая посказка
// использование (tb-tooltip, title="это директива всплывающей подсказки {{document.datestamp  | date}}")
directive("tbTooltip", function(){
    return function(scope, element, iAttrs) {
        iAttrs.$observe('title', function(value) {
            element.removeData('tooltip'); // надо подчистить старые данные
            element.tooltip(); // tooltip bootstrap
        });
    };
});
