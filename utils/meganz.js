import { Storage } from 'megajs';

const megajsStreamUpload = async (megaDetails, file_name, size, stream) => {
	const storage = await new Storage({
		email: `${megaDetails.user}`,
		password: `${megaDetails.pass}`,
		keepalive: false
	}).ready
	await storage.upload({
		name: file_name,
		size: size,
	}, stream).complete
	await storage.close();
}

export {
	megajsStreamUpload
};