var proxy = require('redbird')({port: 80, xfwd: false});

proxy.register("localhost/test", "http://localhost:8080/test");
proxy.register("localhost", "http://localhost:3000");
