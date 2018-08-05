import React, {Component} from 'react';

import Tile from './tile/Tile';

export default class GridView extends Component {

	constructor(props) {
		super(props);
		this.renderTile = this.renderTile.bind(this);
	}

	get gridWidthCellCount() {
		return Math.round(window.innerWidth / 200);
	}

	renderTile(author, series, work) {
		return <Tile author={author} series={series} work={work}
			onClick={() => this.props.itemClick(author, series, work)} styling={this.props.styling}
			/>
	}

	render() {
		return (
			<div>
				{
					this.props.displaySavedTimesSection && (
						<div>
							<h1>{this.props.savedTimesTitle}</h1>
							<div style={{
								display: 'grid',
								gridTemplateColumns: `repeat(${this.gridWidthCellCount}, 1fr)`,
								gridGap: '1em',
								margin: '1em'
							}}>
								{
									this.props.savedTimeWorks.map(book => this.props.savedBook(this.renderTile, book.author, book.series, book, this.props.getStateKey(book.author, book.series, book)))
								}
							</div>
						</div>
					)
				}
				{
					!this.props.displayLibrary ?
						this.props.noBooksFound
					 : (
						<div>
							<h1 style={{
								display: !this.props.displaySavedTimesSection ? 'none' : 'block'
							}}>{this.props.libraryTitle}</h1>
							<div style={{
								display: 'grid',
								gridTemplateColumns: `repeat(${this.gridWidthCellCount}, 1fr)`,
								gridGap: '1em',
								margin: '1em'
							}}>
								{
									this.props.libraryWorks.map( book => this.props.libraryBook(this.renderTile, book.author, book.series, book, this.props.getStateKey(book.author, book.series, book)))
								}
							</div>
						</div>
					)
				}
			</div>
		);
	}
}

