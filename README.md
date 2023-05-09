# Wepay

WePay is a versatile payment system API that enables users to easily deposit, transfer, and withdraw money. Along with these core functions, the API also includes a powerful budget system, an activity log, and a payment option for sellers in real-world markets. With WePay, users can enjoy a streamlined and hassle-free experience when it comes to managing their finances and payments.

## Installation

To run this API locally, you'll need Node.js and MongoDB installed on your system. Clone this repository, then install the required dependencies by running:

```bash
npm install

```
You can start the server by running:
```bash
npm start

```
The API will be available at [Local host](https://localhost:3000).

## Authentication
To access protected routes, you'll need to include an Authorization header with a valid JWT token. 
To obtain a token , first you need to have an account registered , send a POST request to `/api/v1.0/auth/signup` with a JSON payload containing your first Name , last Name , middle Name , email, user Name, phone Number, password, pin:
`notice`: all fields are [string]
```json
{
    "firstName": "jhon",
    "lastName": "doe",
    "middleName": "jane",
    "email": "jhon@example.com",
    "userName": "example",
    "phoneNumber": "0996513429",
    "password": "password123",
    "pin":"1234"
}
```
The response will include an access token , user information , message:
```json
{
    "message": "User created. Check your email for activation code.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDQ1NTc1NTNlMDkxZTY3ODY0NTk2MjkiLCJpYXQiOjE2ODIyNjU5NDJ9.tbisqnaEfVRf3jxfcm_DASannbhiyCPkxKsYSIxQHTs",
    "user": {
        "firstName": "johan",
        "lastName": "doe",
        "middleName": "jone",
        "email": "johan.doe@gmail.com",
        "userName": "johan doe",
        "phoneNumber": "0996513429",
        "password": "$2a$10$.pfEPLKECGdds5oq6FYrB.e2mBOfKISrxkPBP7nTh8BNr5gQu.TRS",
        "pin": "$2a$10$7WExmUX0VZziFoVGkuspWOrVdK3Fs7/DT2VRaCRWknzbuWRnNnGKC",
        "role": 0,
        "Balance": 0,
        "totalIncome": 0,
        "totalPayment": 0,
        "_id": "644557553e091e6786459629",
        "createdAt": "2023-04-23T16:05:41.829Z",
        "updatedAt": "2023-04-23T16:05:41.829Z",
        "qrcode": "841601",
        "__v": 0
    }
}
```
if you need to login again 
send a POST request to `/api/v1.0/auth/login` with a JSON payload containing your email and password and pin:
```json
{
    "email": "johan.doe@gmail.com",
    "password": "password1234",
    "pin":"1234"
}
```
The response will include an access token:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDQ1NTc1NTNlMDkxZTY3ODY0NTk2MjkiLCJpYXQiOjE2ODIyNjYyMzl9.fYJWJnFLQ6hWj53oPuIQc4mE1UXLgzMfExrrsApHsDI"
}
```
Include this token in the Authorization header of subsequent requests:

``Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDQ1NTc1NTNlMDkxZTY3ODY0NTk2MjkiLCJpYXQiOjE2ODIyNjYyMzl9.fYJWJnFLQ6hWj53oPuIQc4mE1UXLgzMfExrrsApHsDI
``

# Endpoints

The following endpoints are available:

### endpoint for updating Basic information to your account :

`PUT /api/v1.0/auth/updateBasic`

where you can upload an image for your account and update your name or phone number
should send it in form-data 
#### Request Body

#### Form Data

| Name         | Type        | Description                      |
| ------------ | ----------- | -------------------------------- |
| imgURL         | file        | Optional. The file to be uploaded |
| firstName        | string      | Optional. Title for the file      |
| lastName  | string      | Optional. Description of the file |
| middleName  | string      | Optional. Description of the file |
| phoneNumber  | string      | Optional. Description of the file |

#### Response
the response will have ....
``` in development until now ```

### endpoint for updating Security information to your account :

`PUT /api/v1.0/auth/updateSecurity`
where you can update the password or PIN 
#### Request Body 
send a  PUT Request with with a JSON payload containing your oldPassword where is `required` and newPassword or newPin:
`notice`: all fields are [string]
```json
{
	"oldPassword":"password1234",
	"newPassword":"asdfgh123456",
	"newPin":"6665"
}
```
#### Response Data 
if the oldPassword sended in the requset the response will have *status code 401* with json data contain message 
```json
{
    "message": "Invalid  password"
}
```
if everything be OK  the response will have *status code 201* with json data contain message 
```json
{
    "message": "security field updated"
}
```


### endpoint for updating payment information to your account :

`PUT /api/v1.0/auth/updatePaymentInfo`
where you can update the bemo bank account number or Syriatel Cash or haram accept number
#### Request Body 
send a  PUT Request with with a JSON payload containing your information where is all `optional` , type: [string]
bemoBank or syriatelCash or haram:
```json
{
    "bemoBank":"P123456789",
    "syriatelCash":"0987654321",
    "haram":"0987654321"
}
```
#### Response Data 

  the response will have *status code 201* if everything be OK with json data contain
  boolean variable Indicates the validity of the modification , message and data field contain some specific user information that is important   
```json
{
    "success": true,
    "message": "User Payment information updated successfully",
    "data": {
        "_id": "644557553e091e6786459629",
        "firstName": "johan",
        "lastName": "doe",
        "email": "johan.doe@gmail.com",
        "userName": "johan doe",
        "role": 0,
        "Balance": 0,
        "totalIncome": 0,
        "totalPayment": 0,
        "bemoBank": "P123456789",
        "syriatelCash": "0987654321",
        "haram": "0987654321"
    }
}
```

### endpoint for updating the role of your acconut from default user to Seller :

`POST /api/v1.0/auth/updateUserToSeller`
where you can update your account role from a default user to a Seller 
#### Request Body 

``` in development until now  ```

#### Response Data 

``` in development until now  ```


### endpoint to show all stores that accept payment from the site :

`GET /api/v1.0/store/getAllStores`
where you can see all seller with name of the store and the location on map or as a text explaind from the seller with the QRcode for everyone if you need to use it 

#### Request Body 

``` nothing should send in the body just a get request  ```

#### Response Data 
in the response data will have *status code 200* , a boolean variable named *success* Indicates the validity of retriving successfuly 
and array named *data* have number of object , each object contain a store details 

```json
{
    "success": true,
    "data": [
        {
            "_id": "64413103e192b85b522492cd",
            "user": {
                "_id": "64412d8e384d9fd94dbac805",
                "qrcode": "794585"
            },
            "storeName": "علي الديوب للدعاية والاعلان",
            "address": "حمص حي الأرمن الجنوبي ",
            "coo": [
                "1.2525",
                "25.5485"
            ],
            "city": "حمص",
            "storeType": "دعاية واعلان",
            "createdAt": "2023-04-20T12:33:07.210Z",
            "updatedAt": "2023-04-20T12:33:07.210Z",
            "__v": 0
        }
    ]
}

```
where `data[0]._id` is the seller id ,
`data[0].user.qrcode` is the QRcode for the seller where is accept the payment ,
`data[0].storeName` is name of the store ,
`data[0].coo[0]` `data[0].coo[1]` is the lat and log of the store location on the mapو and so on .

### endpoint to add payment you need to pay it and need reminder to do that:

`POST /api/v1.0/payment/addPayment`

#### you can add many type of payment 
* قسط شهري
* دين 
* دين لمتجر
* مدفوعات أخرى

where you can detrmine if the user you will pay to it is in the site and have a QRcode to easly pay . 
you can detrmine if the payment is monthly payment, means if you should pay it every start month or every specific day you add .
you can add information for the payment .
you can add payment just for remind .

there is many option you can choose when you add a payment 
#### the main fields you should detrmine  :
1. paymentType [string] :Take one of the types mentioned above . 
2. paymentValue [number] : The total amount of the payment that you must make . 
3. paymentInfo [string] : information of the payment .

#### other fields where are optional :
1. paymentDate [string] : the date you should pay in it , this is an optional field because if you have a payment You don't have to pay it at a specific date
2. isPayable [number] : detrmine if the user you will pay to him/her in the site , take one of this value [0,1] where 0 is not in the site , 1 in the site , default will be 0. 
3. isMonthlyPayable [number] : detrmine if the payment is paid monthly or not , take one of this value [0,1] where 0 is not monthly payable , 1 is payable , default will be 0. 
4. paymentForCode [string] : this take the QRcode for the user you will pay to ,will be `required` if isPayable is 1 .


#### Request Body 

```json
{
	"paymentType":"دين لمتجر",
	"paymentValue":100000,
	"paymentDate":"01-13-2023",
	"paymentInfo":"قسط موبايل جديد لمحل سمير",
	"isPayable":1,
	"isMonthlyPayable":0,
	"paymentForCode":"504451"
}
```

#### Response Data 
the response data have error handling 
1. if the field isPayable is 1 and you enter a invalid paymentForCode 
response will have *status code 400* , success field and message field 
```json 
{
    "success": false,
    "message": " هذا الرمز غير موجود يرجى التأكد من صحة الرمز"
}
```
2. if the paymentType is `دين لمتجر` , and the paymentForCode is not for a seller 
response will have *status code 400* , success field and message field 
```json 
{
    "success": false,
    "message": " صاحب هذا الرمز ليس تاجر يرجى التأكد من صحة الرمز"
}
```
3. if everything is OK 
response will have *status code 201* , success field and message field , data field that have the payment information 
```json
{
    "success": true,
    "message": "payment added",
    "data": {
        "paymentType": "دين لمتجر",
        "paymentValue": 139000,
        "paymentDate": "2023-01-13T00:00:00.000Z",
        "paymentInfo": "قسط موبايل جديد لمحل سمير",
        "isPayable": 1,
        "isMonthlyPayable": 0,
        "user": "644557553e091e6786459629",
        "paymentForUser": "64412db5384d9fd94dbac809",
        "_id": "644edb1c4e25ce716a4dad14",
        "createdAt": "2023-04-30T21:18:20.042Z",
        "updatedAt": "2023-04-30T21:18:20.042Z",
        "__v": 0
    }
}
```

### endpoint to get all payment you added in your account :

`GET /api/v1.0/payment/getAllPayments`

where you can retrive payments with 9 max number per single page

#### Request Body 
you should have access token to get your payments.
you can send a specific number for the page in query params or nothing you will get data from page 1
to send a query params should be like :
`/api/v1.0/payment/getAllPayments?page=2`

where `page=2` is number of the page you need

#### Response Data 

in the response you will get *status code 200* 
data you will get is a `success` boolean variable , `message` , 
array named `data` where contian the payments from the page and each payment have :
1. your first name and last name 
2. user you will pay to him/her if exist in site , you have `first name , last name and QRcode`
3. payments sorted by date   
`currentPage` you are in ,
`totalPages` where is the number of pages you have payments in it, 
`count` which specify number of payment in this page -that is if you don't have max number of payments-

```json

```






### endpoint to delete a payment in your account :

`DELETE /api/v1.0/payment/deletePayment/:id`
you should have access token to delete a payment.
here you can send a DELETE request with a parameter named id which detrmine the id of payment you need to delete,
id you will have it when you retrive all payments from endpoint getAllPayments , you can get it from *data[0]._id*

#### Request Body

just send a delete request with id like that 
`DELETE /api/v1.0/payment/deletePayment/43r534fd3r423fd234443`

#### Response Data 
in the response you will get *status code 200* 
data you will get is a `success` boolean variable , `message` , 
`data` which contain the details of payment you where deleted 
```json 

```





### endpoint to retrive all dealers in site:
