# Node js Master class Assignment 2
The project is the assignment 2 of Nodejs master class.

## Running
There are no dependencies (thus no package.json).
`git clone https://github.com/zainulabidin302/asignment-2-node-masterclass`
`cd asignment-2-node-masterclass`
`node index.js`

API will start on port 3000.
you can chagne that in config.json

To see what endpoints are available, see the docs section.

## DOCS
Docs for the api are generated using apidocs. http://apidocjs.com.

to see what is possible with the api, generate the docs with

`npm install -g apidoc`
inside project directory 

`apidoc -i ./ -o doc`
`open doc/index.html`

NOTE: I have already generated them so you directly navigate to them.

## What is possible with the current project

* Creating user , login, and logout
* Create shopping cart, add items to it and convert it to order.
* Pay via stripe.
* Email sent on successfull order generation.
* All is done via vanilla node.js :).

Thanks Zain <zainulabidin302@gmail.com>
