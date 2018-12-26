import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import Chart from "chart.js";

import Download from "./Download";

import withTheme from "../theme/withTheme";
import withTorrent from "./withTorrent";

export default withRouter(withTheme(withTorrent(class Downloads extends Component {
	state = {
		downloadData: [...new Array(100)].map(x => null),
		uploadData: [...new Array(100)].map(x => null),
		labels: [...new Array(100)].map(x => ''),
		intervalId : null,
	};

	constructor(props) {
		super(props);
		this.chartRef = React.createRef();
		this.update = this.update.bind(this);
	}

	get downloads() {
		return this.props.torrent.downloads;
	}

	componentWillMount() {
		let id = setInterval(this.update, 1000);
		this.setState({intervalId: id});
	}

	componentWillUnmount() {
		if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
	}

	update() {
		const {
			downloadData,
			uploadData,
			labels
		} = this.state;
		//let time = moment();
		//const label = time.format('LTS');
		const download = this.props.torrent.downloadSpeed;
		const upload = this.props.torrent.uploadSpeed;
		downloadData.push(download);
		uploadData.push(upload);
		labels.push('');

		const dataLength = 100;

		this.setState({
			downloadData: downloadData.slice(dataLength*-1),
			uploadData: uploadData.slice(dataLength*-1),
			labels: labels.slice(dataLength*-1)
		});
		if (this.chart) {
			this.chart.data.labels = labels.slice(dataLength*-1);
			this.chart.data.datasets[0].data = downloadData.slice(dataLength*-1);
			this.chart.data.datasets[1].data = uploadData.slice(dataLength*-1);
			this.chart.update({
				duration: 0
			});
		}
	}

	get chartOptions() {
		const {
			downloadData,
			uploadData,
			labels
		} = this.state;
		return {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Downloads',
						borderWidth: 1,
						data: downloadData,
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						borderColor: 'rgba(75, 192, 192, 1)'
					},
					{
						label: 'Uploads',
						borderWidth: 1,
						data: uploadData,
						backgroundColor: 'rgba(54, 162, 235, 0.2)',
						borderColor: 'rgba(54, 162, 235, 1)'
					}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true
						}
					}]
				}
			}
		};
	}

	componentDidMount() {
		this.update();
		this.chart = new Chart(this.chartRef.current, this.chartOptions);
	}

	render() {
		return (
			<div style={{margin:'1em'}}>
				<h1>Active Downloads</h1>
				<div>
					<canvas id="downloadChart" ref={this.chartRef} style={{
						width: '100%',
						height: '6em'
					}}/>
				</div>
				<div>
					{this.downloads.map(download => <Download key={download.infoHash} download={download} />)}
				</div>
			</div>
		);
	}
})))

