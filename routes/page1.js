var express = require('express');

var router = express.Router();
var sqlite3 = require('sqlite3');   //データベースアクセス
var db = new sqlite3.Database('mydb.sqlite3'); //データベースファイル
/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("here");
    //検索
    db.all('SELECT * FROM mydata',(err,rows)=>{
        if(!err){
            var data = { result:'success',message:'件検索されました。',recordList:rows};
            res.render('page1', data);
        } else {
            var data = { result:'err',message:'データベース接続に失敗しました。'};
            res.render('page1',data);
        }
    });
  });
module.exports = router;