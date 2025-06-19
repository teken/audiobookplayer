import React from "react";

import View from "./View";

export default class AuthoredView extends View {
	render() {
		const orderAuthors = [...new Set(this.props.libraryWorks ? this.props.libraryWorks.map(x => x.author) : [])];
		return (
			<div>
				{
					this.props.displaySavedTimesSection && (
						<div>
							<h1 style={{ letterSpacing: '0.03em' }}>{this.props.savedTimesTitle}</h1>
							<div style={this.gridStyle}>
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
					!this.props.displayLibrary ? this.props.noBooksFound
						: (
							<div>
								<h1 style={{
									display: !this.props.displaySavedTimesSection ? 'none' : 'block',
									letterSpacing: '0.03em'
								}}>{this.props.libraryTitle}</h1>
								<div style={this.gridStyle}>
									{orderAuthors.map(author => {
										const items = this.props.libraryWorks
											.filter(x => x.author_id === author.$loki)
											.map(book => this.props.libraryBook(this.renderTile, author, book.series, book, this.props.getStateKey(author, book.series, book)))
											.filter(x => x)
											.reduce((acc, val, i) => i % (this.gridWidthCellCount - 1) === 0 ? acc.concat(<span key={`spacer-start-${author.name}-${i}`} />, val) : acc.concat(val), [])
											.slice(1);

										return [
											items.length > 0 && <h2 key={`title-${author.name}`} style={{ textAlign: 'left' }}>{author.name}</h2>,
											...items,
											items.length > 0 && [...new Array(this.gridWidthCellCount - ((items.length + 1) % this.gridWidthCellCount)).keys()].map(x => <span key={`spacer-end-${author.name}-${x}`} />)
										]
									})
									}
								</div>
							</div>
						)
				}
			</div>
		);
	}
}

