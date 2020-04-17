# Simple SMS Blaster
Simple API Request based SMS blaster with the use of CSV

### Setup (Local)
1. clone this repo
2. run `npm install`
3. setup `.env` according to `.env.example`
4. run `npm start`

### Setup (Heroku)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/nexmo-se/simple-sms-blaster)


### Using the application
1. CSV Template (`mobile_number,text_body`)
2. Send the CSV file via `POST` to `{HOST}/upload` with file parameter `file`.
3. Blaster will start to blast.