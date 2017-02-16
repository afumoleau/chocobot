import * as Slack from 'slack-node';
import * as _ from 'lodash';
import * as moment from 'moment';

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
	weekCounter = Math.floor(moment.duration(Date.now()).asWeeks())-1;
	checkInterval = moment.duration(1, 'second').asMilliseconds();

	constructor() {
		this.slack = new Slack('TOKEN');
		this.userList = [];
		this.channelList = [];
		this.chocoChannel;

		this.retrieveStartData();
		setInterval(() => { this.checkChoco(); }, this.checkInterval);
	}

	retrieveStartData() {
		this.slack.api('users.list', (err, data) => { this.userList = data.members; });
		this.slack.api('channels.list', (err, data) => {
			this.channelList = data.channels;
			this.chocoChannel = _.find(this.channelList, {name: 'choco'});
		});
	}

	checkChoco() {
		var weekCount = Math.floor(moment.duration(Date.now()).asWeeks());
		if(weekCount > this.weekCounter) {
			var nextAlertOccurence = moment().startOf('isoWeek').add(3, 'days').add(15, 'hours');
			if(moment() > nextAlertOccurence) {				
				this.alertChoco();
				this.weekCounter = weekCount;
			}
		}
	}

	alertChoco() {
		this.slack.api('channels.info', {channel: this.chocoChannel.id}, (err, data) => {
			var user = this.chooseNextUser(data.channel.members);
			this.slack.api('chat.postMessage', {text: `<@${user.name}> turn`, channel: this.chocoChannel.id}, () => {});
		});
	}

	chooseNextUser(members) {
		//TODO
		return _.find(this.userList, {id: members[0]});
	}
}

new SlackBot();