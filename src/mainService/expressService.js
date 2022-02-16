let expressService = {
  getApp() {

  },
  serverList: [],
  server: null,
  connections: [],
  listen(route, success,) {
    const express = require('express');
    const app = express();
    const port = 8888;

    // app.use((req, res, next) => {
    //   res.setHeader('Connection', 'close');
    //   next();
    // });

    // 允许跨域
    app.all('*', function (req, res, next) {
      console.log(req.headers.origin)
      console.log(req.environ)
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      // res.header("Access-Control-Allow-Origin", '*');
      res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
      res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("X-Powered-By", ' 3.2.1')
      if (req.method === "OPTIONS") res.send(200);/*让options请求快速返回*/
      else next();
    });

    for (const r of route) {
      app[r.type](r.route, (req, res) => {
        res.send(r.res);
      });
    }

    let server = app.listen(port, (res) => {
      console.log(`Example app listening at http://localhost:${port}`)
      success && success(res);
    });

    server.on('connection', con => {
      console.log('获取连接', con)
      expressService.connections.push(con);
      con.on('close', () => {
        let idx = expressService.connections.indexOf(con)
        expressService.connections.splice(idx, 1)
      });
    });

    this.serverList.push(server)

    return server;
  },
  close(){

  }
};
module.exports = expressService;