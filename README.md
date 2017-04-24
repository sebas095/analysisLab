# analysisLab

[![Build Status](https://travis-ci.org/sebas095/analysisLab.svg?branch=master)](https://travis-ci.org/sebas095/analysisLab)
[![dependencies Status](https://david-dm.org/sebas095/analysisLab/status.svg)](https://david-dm.org/sebas095/analysisLab)
[![Github Issues](https://img.shields.io/github/issues/sebas095/analysisLab.svg)](http://github.com/sebas095/analysisLab/issues)

This is a prototype for the laboratory of analysis of water and food of the UTP.

## Requeriments/dependencies
* [NodeJS](https://nodejs.org/en/)
* [Mongodb](https://docs.mongodb.com/manual/installation/)

## Installation
```bash
npm install or yarn install
```

## Run
```bash
npm start or yarn start
```
## Routes
| url                     | method   | description                | params |
| ----------------------- | -------- | -------------------------- | ------------- |
| /                       |   GET    |  Home page                 |               |
| /profile                |   GET    |  Return user data          |               |
| /profile                |   PUT    |  Modifies user data         |               |
| /users/register         |   GET    |  Page to register users    |               |
| /users/register         |   POST   |  Creates a new user        |  <ul><li>firstname</li><li>lastname</li><li>rol</li><li>email</li><li>password</li></ul>  |
| /users/admin            |   GET    |  Page with admin panel    |               |
| /users/pending/approve  |   GET    |  Page to pending users for account approval |               |
| /users/accountApproval  |   PUT    |  Approval or rejection of an account       |               |
| /users/pending/deactivate |   GET   |  Page to users with account deactivation request |               |
| /users/deactivateAccount  |   PUT    | Approval or rejection  of account deactivation request |               |
| /users/:id/deactivateAccount  |   PUT    | Request for deactivate account       |               |
| /users/:id              |    PUT   |  Modifies user data        |               |
| /users/:id              |    DELETE  | Deactivate user account  |               |
| /account/newPassword    |   GET    | Request for new password   |               |
| /account/emailRecovery  |   POST   | Email is sent with instructions to recover the password   |  <ul><li>email</li></ul>             |
| /account/recovery/:token  |   GET    | Page with password change form  |               |
| /account/recovery/:token  |   PUT    | Save the new password    | <ul><li>password</li><li>confirm password</li></ul>     |
| /session/login          |   GET    |   Login page               |               |
| /session/login          |   POST    |  Create a new session     | <ul><li>email</li><li>password</li></ul>     |
| /session/logout         |   DELETE  |  Destroy a session        |               |
| /quotation/new          |   GET    |   Page to crate quotation  |               |
| /quotation/create       |   POST    |  Create a new quotation   | <ul><li>businessName</li><li>Nit/C.C.</li><li>address</li><li>phone</li><li>email</li><li>total</li><strong>Applicant Info:</strong><li>firstname</li><li>lastname</li><li>document</li><li>position</li><li>phone</li><li>email</li><strong>Sample Info:</strong><li>type</li><li>parameter</li><li>method</li><li>price</li><li>amount</li><li>totalPrice</li></ul>     |
| /quotation/search       |   GET    |   Search quotation page    |               |
| /quotation/search       |   POST    |  Search a specific quotation     | <ul><li>N°</li>Or<li>Nit/C.C.</li></ul>     |
| /quotation/pending/approval |   GET    |  Page to pending quotations for approval  |               |
| /quotation/approval/:id     |   PUT    |  Approval or rejection of a quotation     |               |
| /quotation/pending/delete   |   GET    |  Page to quotations with delete request   |               |
| /quotation/:id/delete       |   PUT    |  Request for delete quotation  |               |
| /quotation/delete/:id       |   DELETE    |  Delete a specific quotation  |               |
| /quotation/:id          |   GET    |  Page for a specific quotation       |               |
| /quotation/:id          |   PUT    |  Modifies a specific quotation   |               |
