const api = require('../');

const TARGET_X = Math.floor(Math.random() * 500) - 250;
const TARGET_Y = Math.floor(Math.random() * 500) - 250;
const TOKEN = '<YOUR_TOKEN>';

let currentX = 0;
let currentY = 0;

const bot = api.createBot({
	url: 'https://thetravelers.live',
	token: TOKEN
});

bot.on('ready', d => {
	currentX = d.x;
	currentY = d.y;
});

const getDir = (x, y) => {
	let dir = '';
	if(y > currentY) dir += 'n';
	else if(y < currentY) dir += 's';
	if(x > currentX) dir += 'e';
	else if(x < currentX) dir += 'w';
	return dir;
};

bot.on('update', d => {
	if(d.x !== undefined) {
		currentX = d.x;
	}
	if(d.y !== undefined) {
		currentY = d.y;
	}
	let dir = getDir(TARGET_X, TARGET_Y);
	console.log(`${currentX}, ${currentY} (${dir}) to ${TARGET_X}, ${TARGET_Y}`);
	if(dir !== '') {
		bot.send({
			action: 'setDir',
			dir,
			autowalk: true
		});
	} else {
		console.log('Reached target');
		bot.send({
			action: 'setDir',
			dir: '',
			autowalk: false
		});
		process.exit(0);
	}
});

bot.login();