import fs, { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";


const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const extractFolderId = async (folderLink) => {
	const matches = folderLink.match(/\/folders\/([-\w]+)/);
	if (matches?.[1]) {
		return matches[1];
	}
	throw new Error('Invalid folder link');
};

const extractFileId = async (fileLink) => {
	const matches = fileLink.match(/\/file\/d\/(.+?)\//);
	if (matches?.[1]) {
		return matches[1];
	}
	throw new Error('Invalid file link');
};

const capitalizeFirstLetter = async (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const createStream = async (url, request_options = {
	method: 'GET',
	credentials: 'include',
	headers: {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
	},
  	}) => {
	try {
		const req_options = {
			method: 'GET',
			credentials: 'include',
			headers: {
			  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
			},
		};
		Object.assign(req_options, request_options)
		const response = await fetch(url, req_options);
		if (response.ok) {
			return Readable.fromWeb(response.body);
		}
		else {
			throw new Error('Failed to fetch url');
		}
	} catch (error) {
		throw new Error(`Error fetching url: ${error.message}`);
	}

};

const createResponse = async (url, request_options = {
	method: 'GET',
	credentials: 'include',
	headers: {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
	},
  }) => {
	try {
		const req_options = {
			method: 'GET',
			credentials: 'include',
			headers: {
			  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
			},
		};
		Object.assign(req_options, request_options)
		const response = await fetch(url, req_options);
		if (response.ok) {
			return response;
		}
		else {
			throw new Error('Failed to fetch url');
		}
	} catch (error) {
		throw new Error(`Error fetching url: ${error.message}`);
	}

};

const downloadFile = async (url, destination, request_options = {
	headers: {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
	},
  }) => {
	try {
		const req_options = {
			method: 'GET',
			credentials: 'include',
			headers: {
			  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
			},
		};
		Object.assign(req_options, request_options)
		const stream = await createStream(url, req_options);
		const fileStream = createWriteStream(destination);
		stream.pipe(fileStream)
		return new Promise((resolve, reject) => {
			fileStream.on('finish', resolve);
			fileStream.on('error', reject);
		});
	} catch (error) {
		throw new Error(`Error downloading file: ${error.message}`);
	}

};

const deleteFile = async (filePath) => {
	try { await fs.promises.unlink(filePath); }
	catch{}
};

const walk = async (dir) => {
    let files = await fs.promises.readdir(dir);
	files = await Promise.all(files.map(async file => {
		const filePath = path.join(dir, file);
		const stats = await fs.promises.stat(filePath);
		if (stats.isDirectory()) return ;
		else if(stats.isFile()) return filePath;
	}));
	return files.reduce((all, folderContents) => all.concat(folderContents), []);
};

const listFolders = async (path) => {
	try {
		const dirents = await fs.promises.readdir(path, { withFileTypes: true });
		const folders = dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
		return folders;
	} catch (error) {
		console.error(error);
		return ([]);
	}
};

export { capitalizeFirstLetter, createResponse, createStream, deleteFile, downloadFile, extractFileId, extractFolderId, listFolders, wait, walk };
