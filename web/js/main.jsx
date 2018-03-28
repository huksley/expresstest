var Vue = require('vue');
var $ = require('jquery');
window.jQuery = $;
var bs = require("bootstrap");

new Vue({
  delimiters: ['${', '}'],
  el: "#vue",
  data: {
    someData: "Hello"
  },
  render: function (h) {
    return (
      <div level={1}>
        <span>{ this.someData }</span> world!
      </div>
    )
  }
})