// https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples
// import  downloadedFile  from './getFilesFromGoogleDrive.js'

// const { downloadedFile } = require('./getFilesFromGoogleDrive.js');

const cron = require('node-cron');
const express = require('express');
const fs = require('fs');
const port = process.env.PORT || 1213;
//const data = require('./weatherData/data.json')

const app = express();
/////////////////////////////////////////////////////////
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
      console.log(`No files found`);
    } 
  });
  
  function downloadedFile(drive, fileId){
    var dest = fs.createWriteStream('./weatherData/data.json');
    let progress = 0;
    let isDone = false; 

    drive.files.get({
      fileId: fileId,
      alt:'media'},
      {responseType:'stream' }
    ).then(res => {
        res.data
        .on('end', () => {
          console.log('Done downloading file.');
          console.log(Date())
          isDone = true;   
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
/////////////////////////////////////////////////////////


cron.schedule('* * * * *', () => {// '* * * * 30' means that the script will be ran every 30 seconds
    console.log('---------------------');
    // console.log('Running Cron Job');
    downloadedFile()
    console.log('File is being downloaded')
});

fs.readFile('./weatherData/data.json', (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return;
    }
    try {
        const rawForecastData = JSON.parse(jsonString);
        //console.log(temperatureData)
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  });

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/newWeatherForecasts',function(req, res, next){
    res.send(data);
})

app.listen(port, () => console.log(`Listening on port ${port}`));