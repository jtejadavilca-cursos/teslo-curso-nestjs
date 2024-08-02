import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if(!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/').pop();
    const fileName = `${uuid()}.${fileExtension}`;
    
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if ( validExtensions.includes(fileExtension) ) {
        return callback(null, fileName);
    }

    callback(null, fileName);
}