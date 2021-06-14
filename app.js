var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var page1Router = require('./routes/page1');

//for CSV
const ExcelJS = require('exceljs');
const fileUpload = require('express-fileupload');
const validator = require('validator');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/page1',page1Router)

//for CSV
app.use(fileUpload({ useTempFiles: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/import', (req, res) => {
  res.render('import');
});

app.post('/import', (req, res) => {
  console.log("here");
  try {
      const workbook = new ExcelJS.Workbook();
      const importFile = req.files.importFile;
      const tempFilePath = importFile.tempFilePath;
      const mimeType = importFile.mimetype;
      let reader;

      if(mimeType === 'text/csv') {
          reader = workbook.csv.readFile(tempFilePath);
      } else if(mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          reader = workbook.xlsx.readFile(tempFilePath);
      }

      reader.then(() => { // インポート
          const worksheet = workbook.getWorksheet(1);
          let data = [];

          for(let i = 1; i <= worksheet.rowCount; i++) {
              const row = worksheet.getRow(i);
              const id = row.getCell(1).value;
              const name = row.getCell(2).value;
              const mail = row.getCell(3).value;
              const age = row.getCell(4).value;

              console.log(data)
              data.push({
                  id: id,
                  name: name,
                  mail: mail,
                  age: age,
                  //createdAt: new Date(),
                  //updatedAt: new Date()
              });
          }
          User.bulkCreate(data);
          res.json({ result: true });
      })
      .catch(error => {
          return res.status(400).send(error.message);
      });
  } catch(error) {
      return res.status(400).send(error.message);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
