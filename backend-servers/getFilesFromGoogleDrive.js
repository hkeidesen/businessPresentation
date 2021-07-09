const fs = require('fs')
// import { fs } from 'fs';
// import { google, GoogleApis } from 'googleapis';
const { google, GoogleApis } = require('googleapis');
const credentials = require('./credentials.json');


const scopes = [
    'https://www.googleapis.com/auth/drive'
  ];

const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);

//Authenicating the service account
const drive = google.drive({ version:"v3", auth});

//accessing the files in the specified folder (where access given to the service account is done through the google api console)
/*
var arryFileDates,file,fileDate,files,folder,folders, newestDate,newestFileID,objFilesByDate;
arrayFileData = [];
objFileByDate = {};
*/
//fileDate = ''

drive.files.list({
    pageSize:1,
    fields:'files(name, id, createdTime)',
}, (err, res) => {
    if (err) throw err;
    const files = res.data.files;
    if (files.length) {
    files.map((file) => {
      //console.log(file);
      //fileId = file.id;
      downloadedFile(drive,file.id);
    });
    } else {
      console.log('No files found');
    } 
  });
  
  const downloadedFile = async (drive, fileId) => {
    var dest = fs.createWriteStream('./weatherData/data.json');
    let progress = 0;

    drive.files.get({
      fileId: fileId,
      alt:'media'},
      {responseType:'stream' }
    ).then(res => {
        res.data
        .on('end', () => {
          console.log('Done downloading file.');
          console.log(Date())
        })
        .on('error', err => {
            console.log('Error', err);  
        })
        .on('data', d => {
          progress += d.length;
          if (process.stdout.isTTY){
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Downloaded ${progress} bytes. `);
          }
        })
        .pipe(dest);
      });      
    }
