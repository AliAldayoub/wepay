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
send a  PUT Request with with a JSON payload containing your information where is all `optional`
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
### endpoint for updating payment information to your account :

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
where data[0]._id is the seller id , data[0].user.qrcode is the QRcode for the seller where is accept the payment , data[0].storeName is name of the store , data[0].coo[0] data[0].coo[1] is the lat and log  of the store location on the map 


