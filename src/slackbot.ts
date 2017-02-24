import * as Slack from 'slack-node';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as express from 'express';
import * as socketio from 'socket.io';
import * as cors from 'cors';

type Channel = {
	id:string,
	name:string,
	members:string[]
}

type User = {
	id:string,
	name:string
}

class SlackBot {
	slack : Slack;
	userList: User[];
	channelList: Channel[];
	chocoChannel: Channel;
	periodCounter = 0;
	checkInterval = moment.duration(0.5, 'second').asMilliseconds();
	alertOffset = moment.duration();
	period = 'second';
	startDate = moment();
	httpServer = express();
	socketioServer;

	constructor() {
		this.slack = new Slack('TOKEN');
		this.userList = [];
		this.channelList = [];
		this.chocoChannel;

		this.retrieveStartData();
		setInterval(() => { this.checkChoco(); }, this.checkInterval);

		this.httpServer.use(cors());
		this.httpServer.get('/channels', (req, res) => { res.send(this.channelList); });
		this.httpServer.get('/users', (req, res) => { res.send(this.userList); });
		this.httpServer.listen(24601);

		this.socketioServer = socketio.listen(24602);
	}

	retrieveStartData() {
		this.slack.api('users.list', (err, data) => { this.userList = data.members; });
		this.slack.api('channels.list', (err, data) => {
			this.channelList = data.channels;
			this.chocoChannel = _.find(this.channelList, {name: 'codingdojotest'});
		});
	}

	checkChoco() {
		var periodCount = Math.floor(moment.duration(moment().diff(this.startDate)).as(this.period as any));
		if(periodCount > this.periodCounter) {
			var nextAlertOccurence = moment().startOf(this.period as moment.unitOfTime.StartOf).add(this.alertOffset);
			if(moment() > nextAlertOccurence) {
				this.alertChoco(periodCount);
				this.periodCounter = periodCount;
			}
		}
	}

	alertChoco(periodCount: Number) {
		this.slack.api('channels.info', {channel: this.chocoChannel.id}, (err, data) => {
			var user = this.chooseNextUser(data.channel.members, periodCount);
			//this.slack.api('chat.postMessage', {text: `<@${user.name}> turn`, channel: this.chocoChannel.id}, () => {});
			this.socketioServer.emit('turn', user.name);
			console.log(user.name);
		});
	}

	chooseNextUser(members, count) {
		return _.find(this.userList, {id: members[count % members.length]});
	}
}

new SlackBot();