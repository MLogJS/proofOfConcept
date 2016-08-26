const start = Date.now()
process.on('exit', function logTime() {
    const end = Date.now()
    let dur = (end - start) / 1000
    console.log('Ran for:', dur)
})

const _ = require('highland')
const path = require('path')
const fs = require('fs')

module.exports = function filePressStarter(sourceFolder) {
	const sourcePath = path.resolve(sourceFolder)
	console.log(sourcePath);
	let fileStream = startStream(sourcePath)
	fileStream = fileStream.map(filepath => ({
		path: filepath,
		extension: path.parse(filePath).ext
	})).map(file => {
		console.log(file)
		return file
	})

	function currentPress() {
		return {
			use: (changer) => {
				fileStream = fileStream.map(changer)
				return currentPress()
			}
		}
	}
	return currentPress()
}

function startStream(root) {
	console.log('Starting stream from ', root);
	return _(function(push, next) {
		console.log('calling walk')
        walk(root, push, () => {
            push(null, _.nil)
        })
    })
}

/**
 *   Walks a filestructure starting from a given root and pushes all found
 *   files onto a given stream.
 *   @param  {String}   dir    - Root directory
 *   @param  {Function} push   - Push function for a highland stream
 *   @param  {Function} done   - Callback will be called with (err, foundFiles)
 */
function walk(dir, push, done) {
	console.log('walk', dir);
    fs.readdir(dir, function(err, list) {
        if (err) return done(err)
        var pending = list.length
        list.forEach(function(file) {
            file = path.resolve(dir, file)
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, push, function(err, res) {
                        if (!--pending) done()
                    })
                } else {
					console.log(file);
                    push(null, file)
                    if (!--pending) done()
                }
            })
        })
    })
}