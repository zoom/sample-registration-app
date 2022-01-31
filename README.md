# Zoom Webinar Registration Sample

Use of this sample app is subject to our [Terms of Use](https://zoom.us/docs/en-us/zoom_api_license_and_tou.html)

This application is an example of how you can use
the [Zoom API](https://marketplace.zoom.us/docs/api-reference/zoom-api)
to create your own webinar registration app that stays within the
Zoom [Rate Limits](https://marketplace.zoom.us/docs/api-reference/rate-limits)

It's built using mostly standard HTML, CSS and JS with familiar packages such as:

1. [Expressjs](https://expressjs.com/)
2. [Handlebars](https://handlebarsjs.com/)
3. [Bulma](https://bulma.io/)
4. [In-memory MongoDB Server](https://github.com/nodkz/mongodb-memory-server)

## Prerequisites

1. A Zoom Account
    1. [Pro Plan or higher](https://support.zoom.us/hc/en-us/articles/207278726-Plan-Types-)
    2. [Webinar Add-on](https://support.zoom.us/hc/en-us/articles/200917029)
2. The API Key and Secret from a [Zoom JWT App](https://marketplace.zoom.us/docs/guides/auth/jwt/)

You can follow [this guide](https://marketplace.zoom.us/docs/guides/build/jwt-app/) to create a JWT app with
the [Zoom Marketplace](https://marketplace.zoom.us/).

## Installation

To get started clone the repo:

```shell
git clone https://github.com/zoom/sample-registration-app.git
```

Once cloned navigate to the `sample-registration-app` directory:

```
cd sample-registration-app
```

## Setup

```
npm install
```

### Add Your Credentials

Create a .env file in the current directory

```shell
touch .env
```

Edit the file and add the following text replacing the fields with **your actual API Key and API Secret** from
the [Zoom Marketplace](https://marketplace.zoom.us/):

```text
ZM_KEY={{ YOUR API KEY HERE }}
ZM_SECRET={{ YOUR API SECRET HERE }}
```

## Start the Server

As the default database for this project lives in-memory each time you restart the server the database will be cleared.
See our section on
[Configuring MongoDB](#configuring-mongodb).

#### Development

To start the server in development mode run the NPM `dev` script. This will do the following:

1. Send detailed logs to the server console and error pages
2. Restart the server on changes to server files - this will clear the in-memory DB
    1. To change this use a standard mongod instance
    2. or use `node` instead of `nodemon` for the `dev` script in [package.json](package.json)
    3. or start the server using the `start` NPM script (see next section)

```shell
npm run dev
```

#### Production

You can use the `start` script to run the server in production mode. This allows the app to run faster but it does not
log by default and does watch for files changes.

```shell
npm run start
```

## Usage

Navigate to http://localhost:3000 to view the home page or go to `/r/:webinar_id` and the app will guide you through the
registration process.

## Deployment

You can deploy this app on any service that allows you to host dynamic Node.js apps:

1. [Heroku](https://devcenter.heroku.com/articles/deploying-nodejs)
2. [Google Cloud](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/nodejs)
3. [AWS](https://aws.amazon.com/getting-started/hands-on/deploy-nodejs-web-app/)

### Configuring MongoDB

This app uses an in-memory instance of MongoDB to ensure the project is easy to set up. Out of the box, you don't need
to do anything.

If you want to use a real instance of MongoDB, all you need to do is:

1. Remove the references to `mongo-memory-server` found in
    1. The beginning of [server/index.js](server/index.js)
    2. The dependencies in [package.json](package.json)
2. Provide `mongoose.connect()` with your connection string in [server/index.js](server/index.js).

## Contribution

Please send pull requests and issues to this project for any issues or suggestions that you have!

### Code Style

This project uses eslint to enforce a coding style along with a pre-commit git hook to ensure files pass linting prior
to commit.

You can run `npm run lint` to see the linter errors directly or your can use `npm run lint-fix` to have eslint try to
fix the issues for you. Most IDEs can also automatically fix linter errors as you save.

### Testing

At this time there are no e2e or unit tests. I encourage you to create a pull request adding tests! I
hear [Cypress](https://www.cypress.io/) is a great framework :)

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or
our [Developer Forum](https://devforum.zoom.us). Priority support is also available
with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
