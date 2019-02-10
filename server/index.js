const compression = require('compression');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const path = require('path');
const user = require('./user');
const github = require('./github');
const pdf = require('./pdf');
const pandoc = require('./pandoc');

const resolvePath = pathToResolve => path.join(__dirname, '..', pathToResolve);

module.exports = (app, serveV4) => {
  if (process.env.NODE_ENV === 'production') {
    // Enable CORS for fonts
    app.all('*', (req, res, next) => {
      if (/\.(eot|ttf|woff2?|svg)$/.test(req.url)) {
        res.header('Access-Control-Allow-Origin', '*');
      }
      next();
    });

    // Use gzip compression
    app.use(compression());
  }

  app.get('/oauth2/githubToken', github.githubToken);
  app.get('/userInfo', user.userInfo);
  app.post('/pdfExport', pdf.generate);
  app.post('/pandocExport', pandoc.generate);
  app.post('/paypalIpn', bodyParser.urlencoded({
    extended: false,
  }), user.paypalIpn);

  if (serveV4) {
    /* eslint-disable global-require, import/no-unresolved */
    app.post('/sshPublish', require('../stackedit_v4/app/ssh').publish);
    app.post('/picasaImportImg', require('../stackedit_v4/app/picasa').importImg);
    app.get('/downloadImport', require('../stackedit_v4/app/download').importPublic);
    /* eslint-enable global-require, import/no-unresolved */
  }

  // Serve static resources
  if (process.env.NODE_ENV === 'production') {
    // Serve index.html in /app
    app.get('/', (req, res) => res.sendFile(resolvePath('dist/index.html')));

    // Serve style.css with 1 day max-age
    app.get('/style.css', (req, res) => res.sendFile(resolvePath('dist/style.css'), {
      maxAge: '1d',
    }));

    // Serve the static folder with 1 year max-age
    app.use('/static', serveStatic(resolvePath('dist/static'), {
      maxAge: '1y',
    }));

    app.use(serveStatic(resolvePath('dist')));

    if (serveV4) {
      app.use(serveStatic(path.dirname(resolvePath('stackedit_v4/public/cache.manifest'))));

      // Error 404
      app.use((req, res) => res.status(404).sendFile(resolvePath('stackedit_v4/views/error_404.html')));
    }
  }
};
