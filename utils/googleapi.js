import { google } from "googleapis";

const createDriveService = (SaFilePath) => {
	const SCOPES = [
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/drive.appdata',
		'https://www.googleapis.com/auth/drive.file'
	];
	const auth = new google.auth.GoogleAuth({
		// keyFile: SaFilePath,
		credentials: SaFilePath,
		scopes: SCOPES
	});

	return google.drive({ version: 'v3', auth: auth });
};

const storageCheck = async (SaFilePath) => {
	const driveService = createDriveService(SaFilePath);
	const res = await driveService.about.get({ fields: 'storageQuota' });

	if (res.status >= 200 && res.status < 300) {
		return res.data.storageQuota;
	}
	throw new Error(res.errors);
};

const uploadStream = async (uploadStream, folder_id, file_name, SaFilePath, uploadOrSet = "upload") => {
	const driveService = createDriveService(SaFilePath);

    const fileMetadata = {
        name: file_name,
        parents: [folder_id]
    };

    const media = {
        mimeType: 'application/octet-stream',
        body: uploadStream
    };
    const res = await driveService.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, driveId',
        supportsAllDrives: true,
    });

    if (res.status >= 200 && res.status < 300) {
        if (uploadOrSet == "set") {
            return res.data
        }
        else{
            return res.data.id.trim();
        }
    }

    throw new Error(res.errors);
};

const deleteAllFiles = async (SaFilePath) => {
	const driveService = createDriveService(SaFilePath);
	let storage = await storageCheck(SaFilePath);
	while (parseFloat(storage.usage) > 0) {
		const response = await driveService.files.list();
		if (response.status === 200 && response.data.files.length !== 0) {
			for (const file of response.data.files) {
				try {
					await driveService.files.delete({
						fileId: file.id,
						supportsAllDrives: true
					});
				} catch {}
			}
		}
		storage = await storageCheck(SaFilePath);
	}
};

const listAllFiles = async (SaFilePath) => {
	const driveService = createDriveService(SaFilePath);
	const response = await driveService.files.list();
	return response.data.files;
};

const deleteOneFile = async (SaFilePath, fileID) => {
	const driveService = createDriveService(SaFilePath);
	await driveService.files.delete({
		fileId: fileID,
		supportsAllDrives: true
	});
};

export {
	deleteAllFiles,
	deleteOneFile,
	listAllFiles, storageCheck,
	uploadStream
};