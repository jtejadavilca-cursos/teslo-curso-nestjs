
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if(!file) return callback(new Error('File is empty'), false);

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    console.log('File is valid...');
    callback(null, true);
};