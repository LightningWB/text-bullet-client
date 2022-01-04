const events = require('events');
const axios = require('axios');
const socketIoClient = require('socket.io-client');

class Bot extends events.EventEmitter {
	constructor(config) {
		super();
		if(typeof config.url !== 'string') throw new Error('url is required');
		if(typeof config.token !== 'string') throw new Error('token is required');
		this.token = config.token;
		this.url = config.url;
	}

	async login(captcha = '') {
		const res = await axios.post(`${this.url}/default.aspx/GetAutoLog`, {captcha}, {
			headers: {
				'Content-Type': 'application/json',
				Cookie:  'T=' + this.token
			}
		});
		const json = res.data;
		switch(json.d) {
			case '1': throw new Error('Invalid token');
			case '19': throw new Error('The server is currently down for maintenance.');
			case '49': throw new Error('You have too many accounts logged in from this ip address.');
			case '39': throw new Error('Invalid captcha');
			case 'spam': throw new Error('You have been flagged as a spammer.');
		}
		const data = JSON.parse(json.d).data;
		this.conn = socketIoClient.io(this.url, {
			transportOptions: {
				polling: {
					extraHeaders: {
						'Cookie': 'T=' + encodeURIComponent(this.token)
					}
				}
			}
		});
		this.conn.on('play_auth', auth => this.play_auth = auth);
		this.conn.on('raw', js => this.emit('raw', js));
		this.conn.on('error', err => this.emit('error', err));
		this.conn.on('getGameObjectNoCountdown', obj => this.emit('updateImmediate', obj));
		this.conn.on('getGameObject', obj => this.emit('update', obj));

		this.conn.once('connect', () => {
			this.emit('ready', data);
		});
		this.conn.connect();
	}

	send(data) {
		if(this.play_auth === undefined) throw new Error('Not logged in');
		this.conn.send(data, this.play_auth);
	}
};

/**
 * 
 * @returns {Bot}
 */
module.exports.createBot = function(config) {
	return new Bot(config);
}