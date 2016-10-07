var proxy = require('redbird')({port: 80, xfwd: false});

// proxy.register("wks-0014.apache", "http://localhost:8080");
proxy.register("wks-0014.local", "http://localhost:3000");
