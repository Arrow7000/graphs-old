function sayHi() {
	console.log("Hi!");
}


var nodeNum = 6;

var lineConnections = [{
	from: 0,
	to: 1
}, {
	from: 0,
	to: 2
}, {
	from: 0,
	to: 3
}, {
	from: 0,
	to: 4
}, {
	from: 1,
	to: 2
}, {
	from: 1,
	to: 5
}, {
	from: 2,
	to: 3
}, {
	from: 2,
	to: 4
}, {
	from: 3,
	to: 5
}, {
	from: 4,
	to: 5
}, {
	from: 2,
	to: 5
}];

// var nodeNum = 0;

// var lineConnections = [];

$(document).ready(function() {
	$("#reset-btn").on('click', function() {
		window.globals.init();
	});

	$("#new-node").on('click', function() {
		window.globals.newNode();
	});
});
