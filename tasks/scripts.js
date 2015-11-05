(function(){
  var fs    = require('fs'),
    coffee  = require('coffee-script'),
    config  = require('../bolt-config'),
    src     = config.paths.sources,
    dest    = config.paths.destinations,
    opts    = config.pluginOpts,
    utils   = require('./utils'),
    args    = utils.getArgs(process.argv),
    compile = function() {
      utils.readFiles(src.scripts, true, function(files) {
        var scripts = coffee.compile(files, opts.coffee);
        utils.checkPath(dest.scripts);
        if (args.licensed) {
          scripts = utils.license(scripts);
        }
        fs.writeFileSync(dest.scripts + config.name + '.js', scripts);
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
