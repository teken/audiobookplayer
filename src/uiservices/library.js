export default class LibraryService {
	constructor(gunService) {
		this.gunService = gunService;
	}

	addAuthor(data) {
		const author = this.gunService.get(`author#${data.name}`).put(data);
		this.gunService.get('authors').set(author);
		return author;
	}

	addSeries(data, authorName) {
		const author = this.gunService.get(`author#${authorName}`);
		const series = this.gunService.get(`series#${data.name}`).put(data);

		series.get('author').put(author);
		this.gunService.get('series').set(series);
		return series;
	}

	addBook(data, authorName, seriesName) {
		const author = this.gunService.get(`author#${authorName}`);

		const book = this.gunService.get(`book#${data.name}`).put(data);

		this.gunService.get('books').set(book);

		if (seriesName) {
			const series = this.gunService.get(`series#${seriesName}`);
			book.get('series').put(series);
		}

		book.get('author').put(author);
		author.get('books').set(book);
		return book;
	}

	getBook(name) {
		return this.gunService.get(`book#${name}`).then();
	}

	getBooks() {
		return this.gunService.get('books').map();
	}

	getSeries(name) {
		return this.gunService.get(`series#${name}`).then();
	}

	getAllSeries() {
		return this.gunService.get('series').map();
	}

	getAuthor(name) {
		return this.gunService.get(`author#${name}`).then();
	}

	getAuthors() {
		return this.gunService.get('authors').map();
	}

	importFileTree(fileTree) {
		fileSystem.forEach(file => {
			const author = this.addAuthor({name:file.name});

			if (file.isDirectory()) file.children.forEach( work => {
				if (work.isFile()) return;
				let record = { name: work.name };

				if (work.children[0].isDirectory()) { //series
					const series = this.addSeries(record, file.name);

					work.children.forEach(child => {
						let cRecord = { name: child.name };
						this.addBook(cRecord, file.name, record.name)
					});
				} else { //file
					const book = this.addBook(record, file.name, null);
				}




				if (record.$loki) works.update(record);
				else works.insert(record);
			});
		});
	}
}
