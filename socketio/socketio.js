

module.exports = function socket(io){
	
	io.on('connection', socket => console.log('New socket is connecting...'));

}