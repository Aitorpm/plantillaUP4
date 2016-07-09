
/*
 * GET home page.
 */

exports.index = function(req, res){
  //res.render('index', { title: 'Express' });
  res.redirect('index.html');
};

/*exports.test = function(req,res){
  console.log(req.body.test);
  console.log(req.body.test2);
  res.send('OK');
};*/



