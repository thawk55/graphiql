# GraphiQL Query Browser

A customization of [GraphiQL](https://github.com/graphql/graphiql) that supports multiple endpoint 
definitions and Authorization headers.

## Using

To run:
* `npm install`
* `npm start` or `PORT=<port> npm start`

This should open the app in a browser tab. The default port is 3000. To set a different
default port, create an `.env` file in the project folder that contains the following line:

```bash
PORT=<port>
```

## Developing

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app),
so consult the docs there for dev tools/commands that are available.

Due to https://github.com/webpack/webpack/issues/781, if you are using vim
make sure to set backupcopy=yes or the dev server won't see your changes.
