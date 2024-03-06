const express = require('express');
const cors = require("cors");
const Minio = require('minio')
const multer = require('multer');
const Fs = require('fs');

const app = express();
// Middlewares
app.use(cors());
app.use(express.json());

const port = 8080;

var minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL:false,
    accessKey: 'yVeToeQJU0VRhuZ1d194',
    secretKey: 'dbmsfdlcVw26FQXgrDkkjPy8v74ZFAPhvPtA7Kt0'
})


//get specific file download link
app.get('/presignedUrl', (req, res) => {

    minioClient.presignedGetObject('hello', 'Screenshot 2023-08-09 131405.png', (err, url) => {
        if (err) throw err

        res.redirect(url)
    })

})


app.get("/buckets", async(req,res) => {
   
    try {
        const buckets = await minioClient.listBuckets()
        console.log('Success', buckets)
      } catch (err) {
        console.log(err.message)
      }
  
    res.json(buckets);
});


//get signed url to upload a file from frontend
app.get('/preSignedUrlToUploadObject', (req, res) => {
    minioClient.presignedPutObject('abc', req.query.name, (err, url) => {
        if (err){
            console.log('error',err);
            res.send(err)
        }
        res.send(url)
    })
});


//upload file from frontend to backend and save it to minio server(use multer for file upload)

const UPLOADS_FOLDER='./uploads/'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null,UPLOADS_FOLDER)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      return cb(null, `${Date.now()}-${file.originalname}`)
    }
  })
  
  const upload = multer({ storage })

app.post('/upload-file-to-minio', upload.single('image'), (req, res) => {
    // Handle the uploaded file
    console.log(req.file.filename)
    const filePath=`./uploads/${req.file.filename}`
    const fileStream = Fs.createReadStream(filePath);
    minioClient.putObject('abc', `${req.file.filename}`, fileStream, function(err, objInfo) {
        if (err) {
          return console.log(err);
        }
        console.log('Success', objInfo);
      });
    return  res.status(200).send('File uploaded successfully.');
});

//upload file to bucket
app.get("/upload", async(req,res) => {
  
  const file = './assets/SampleVideo_1280x720_2mb - Copy.mp4'

  await minioClient.fPutObject('abc', 'SampleVideo', file, function (err, objInfo) {
    if (err) {
      return console.log(err)
    }
    console.log('Successfully upload', objInfo.etag, objInfo.versionId)
  })


});

// Delete file endpoint
app.delete('/files/:bucketname/:filename', async(req, res) => {
  console.log(req.params);
  const bucketName = req.params.bucketname;
  const objectName = req.params.filename;
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`Object ${objectName} deleted successfully from bucket ${bucketName}`);
    return  res.status(200).send(`Object ${objectName} deleted successfully from bucket ${bucketName}`);
  } catch (err) {
  
    console.error(`Error deleting object: ${err}`);
    return res.send(err)
  }
});


app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Express app running on port ${port}!`));