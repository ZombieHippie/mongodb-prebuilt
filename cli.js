'use strict';
var proc = require('child_process');
var path = require('path');

module.exports = function(exec_name) {
	var debug = require('debug')('mongodb-prebuilt:' + exec_name);
	var exec_path = require('./index').bin_path();
	var exec_bin = exec_path + exec_name;
	var exec_args = process.argv.slice(2)

	debug("exec_path: %s", exec_bin);
	debug("exec_args: %s", exec_args);
	
  var oldSpawn = proc.spawn;
  proc.spawn = function debugSpawn() {
    debug('spawn called:')
    debug(arguments)
    var result = oldSpawn.apply(this, arguments);
    return result;
  };

	var child = proc.spawn(exec_bin, exec_args, {stdio: 'inherit'});
	child.on('close', function (code) {
  	process.exit(code);
	});

	var monitor_child = proc.spawn(
		"node",
		[ path.join(__dirname, "binjs", "mongokiller.js"),
		process.pid, child.pid], 
		{stdio: 'inherit', detached: false}
	);
}
