import React, {Component} from "react";

export default class View extends Component {

	constructor(props) {
		super(props);
		this.renderTile = this.renderTile.bind(this);
	}

	get gridWidthCellCount() {
		return Math.round(window.innerWidth / this.props.cellWidthDivider);
	}

	renderTile(author, series, work, key) {
		return <this.props.itemComponent key={key} author={author} series={series} work={work}
			onClick={() => this.props.itemClick(author, series, work)}
			/>
	}

	render() {
		return (
			<div>
				{
					this.props.displaySavedTimesSection && (
						<div>
							<h1 style={{letterSpacing: '0.03em'}}>{this.props.savedTimesTitle}</h1>
							<div style={{
								display: 'grid',
								gridTemplateColumns: `repeat(auto-fit,minmax(${this.props.cellWidthDivider}px, 1fr))`,
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
								display: !this.props.displaySavedTimesSection ? 'none' : 'block',
								letterSpacing: '0.03em'
							}}>{this.props.libraryTitle}</h1>
							<div style={{
								display: 'grid',
								gridTemplateColumns: `repeat(auto-fit,minmax(${this.props.cellWidthDivider}px, 1fr))`,
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

