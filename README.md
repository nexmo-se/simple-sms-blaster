# Simple SMS Blaster
Simple API Request based SMS blaster with the use of CSV

### Setup (Local)
1. clone this repo
2. run `npm install`
3. setup `.env` according to `.env.example`
4. run `npm start`

### Setup (Heroku)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/nexmo-se/simple-sms-blaster)


### Using the application (JSON)
You can directly send a batch SMS request. However, do take note of the request timeout period imposed by your PaaS provider or server framework and adjust the number of records per request accordingly.

#### Request
```
POST /send

body:
{
  "campaign": STRING - a name that will be used for client-ref
  "records": [
    {
      "uuid": STRING - identifier,
      "to": STRING - recipient mobile number,
      "text": STRING - SMS text,
    },
    {
      "uuid": STRING - identifier,
      "to": STRING - recipient mobile number,
      "text": STRING - SMS text,
    },

    ...

  ]
}
```

#### Response
```
[
  {
    "message-count": STRING - see Vonage SMS API Documentation,
    "messages": [
      {
        "to": STRING - see Vonage SMS API Documentation,
        "message-id": STRING - see Vonage SMS API Documentation,
        "status": STRING - see Vonage SMS API Documentation,
        "remaining-balance": STRING - see Vonage SMS API Documentation,
        "message-price": STRING - see Vonage SMS API Documentation,
        "network": STRING - see Vonage SMS API Documentation,
      },

      ...

    ],
    "uuid": STRING - identifier,
    "to": STRING - recipient mobile number,
    "text": STRING - SMS text,
  }
]
```

Vonage SMS API Documentation: https://developer.nexmo.com/api/sms?theme=dark#send-an-sms

#### Example
![Example](https://github.com/nexmo-se/simple-sms-blaster/blob/master/images/sms-blaster.png?raw=true)


### Using the application (CSV)
1. CSV Template (`mobile_number,text_body`)
2. Send the CSV file via `POST` to `{HOST}/upload` with file parameter `file`.
3. Blaster will start to blast.

### Sample CSV
```
6512341234,This is a text
6556785678,This is another text
```