# Cleaning tool for firebase
Node.js based tool to clean the database used in [this project](https://github.com/stity/threejs-atlas-viewer).

## Install
``` shell
npm install
```
This tool uses gulp to encrypt and decrypt the credentials.

To install it run :
``` shell
npm install -g gulp-cli
```

## Run
To decrypt the credentials and clean the database run :
``` shell
gulp
```

To encrypt the credentials :
``` shell 
gulp encrypt
```

To decrypt the credentials :
``` shell
gulp decrypt
```

To clean the database (require credentials) :
``` shell
node index.js
```