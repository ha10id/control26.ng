/* Components */
class MyComponent {
    get bindedValue() {
        return this.$value;
    }

    set bindedValue(value) {
       this.$value = value;
       // а теперь вызовем метод, который должен обновить что-то
       // вместо того, что бы вешать неявный ватчер
       this.makeSomethingWithNewValue();
    }
}

angular.module('myApp.components', []).component('myComponent', {
   bindings: {
       "bindedValue": "="
   },
   template: `<div>Какой-то шаблон</div>`,
   controller: MyComponent
});