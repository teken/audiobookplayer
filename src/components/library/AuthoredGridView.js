import React, {Component} from 'react';

import Tile from './tile/Tile';

export default class AuthoredGridView extends Component {

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
		const orderAuthors = [...new Set(this.props.libraryWorks ? this.props.libraryWorks.map(x => x.author) : [])];
		return (
			<div>
				{
					this.props.displaySavedTimesSection && (
						<div>
							<h1>Saved Times</h1>
							<div style={{
								display: 'grid',
								gridTemplateColumns: `repeat(${this.gridWidthCellCount}, 1fr)`,
								gridGap: '1em',
								margin: '1em'
							}}>
								{
									orderAuthors.map(author => {
										return this.props.savedTimeWorks.filter(x => x.author_id === author.$loki).map(book => this.props.savedBook(this.renderTile, book.author, book.series, book, this.props.getStateKey(book.author, book.series, book)))
									})
								}
							</div>
						</div>
					)
				}
				{
					!this.props.displayLibrary ? (
						<h1>no books to be found, maybe import some</h1>
					) : (
						<div>
							<h1 style={{
								display: !this.props.displaySavedTimesSection ? 'none' : 'block'
							}}>Library</h1>
							<div style={{
								display: 'grid',
								gridTemplateColumns: `repeat(${this.gridWidthCellCount}, 1fr)`,
								gridGap: '1em',
								margin: '1em'
							}}>
								{orderAuthors.map(author => {
									const items = this.props.libraryWorks.filter(x => x.author_id === author.$loki).map(book => this.props.libraryBook(this.renderTile, author, book.series, book, this.props.getStateKey(author, book.series, book)))//this.props.libraryWorks.filter(x => x.author_id === author.$loki).map(book => this.props.libraryBook(this.renderTile, author, book.series, book, this.props.getStateKey(author, book.series, book)))
										.reduce((acc, val) => acc.concat(val), [])
										.filter(x => x)
										.reduce((acc, val, i) => i%(this.gridWidthCellCount-1) === 0 ?acc.concat(<span key={`spacer-start-${author.name}-${i}`}/>,val) : acc.concat(val), [])
										.slice(1);

									return [
										items.length > 0 && <h2 key={`title-${author.name}`} style={{textAlign:'left'}}>{author.name}</h2>,
										...items,
										items.length > 0 && [...Array(this.gridWidthCellCount-((items.length+1)%this.gridWidthCellCount)).keys()].map(x => <span key={`spacer-end-${author.name}-${x}`}/>)
									]})
								}
							</div>
						</div>
					)
				}
			</div>
		);
	}
}

