# Gesundr API - Running and Building the Application

## Prerequisites

Before you can run or build the application, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (either a local instance or a cloud instance)

## Getting Started

### 1. Clone the Repository

```sh
$ git clone <repository_url>
$ cd fasthealthtrack-api
```

### 2. Install Dependencies

```sh
$ npm install
```

### 3. Set Environment Variables

Create a `.env` file in the root of the project and add the following environment variables:

```sh
MONGODB_URI=mongodburl
JWT_SECRET=your_secret_key
```

## Running the Application

To run the application, use the following command:

```sh
$ npm run dev
```

The application will be running at `http://localhost:3000`.

## Migrations

To run migrations, `migrate-mongo` has been set up.

### 1. Install migrate-mongo

```sh
$ npm install -g migrate-mongo
```

### 2. Create a Migration

```sh
$ migrate-mongo create [migration_name]
```

### 3. Run Migrations

```sh
$ migrate-mongo up
```

### 4. Rollback Migrations

```sh
$ migrate-mongo down
```
