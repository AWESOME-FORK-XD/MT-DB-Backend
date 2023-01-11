# Summary

This is the API Backend environment used by both Medten Product DB and Medten Product Catalog applications.

It includes:

* CRUD APIs for virtually all of the database tables in the Medten Product database.
* Authentication and Authorization to support logins.


## AWS Setup

This application is deployed as a "serverless" application on AWS. Each application has its own AWS template file, as defined in the `sam-backend-[environment].yaml` files in the root folder. The AWS services used are:

* API Gateway - provides the URLs exposed as the API
* Lambda - for NodeJS functions for handling calls received throught API gateway
* CloudWatch Logs - Lambda functions produce logs in CloudWatch


### Prerequisites for AWS Development
It is highly recommended to use VSCode or an IDE that supports the AWS command line environment.
1. The AWS CLI must be installed on your machine.
1. You should run `aws configure` to log in to AWS as the correct IAM user and region before running any AWS CLI operations.

## How to Package and Deploy the Application on AWS
### Prerequisite: .env files.

Included in the root folder is an [example.env](./example.env) file. This specifies the  environment-specific variables needed to deploy and run code. If you were not not provided .env files, copy the example.env file and rename it following the convention `.env.[environment].local` where environment is one of `development`, `test`, or `production`. Note that `.env.*.local` files **MUST NOT BE SAVED under version control**, because they typically contain credentials and/or sensitive information. Keep them in a secure, password-protected, encrypted storage (such as a password manager).

For example, prior to deploying to a development, test or production environment you must have `.env.development.local`, `.env.test.local`, `.env.production.local` files respectively available in the root of the project.

### Package and Deploy the application code.

Before packaging and deploying the code, it is important to understand two variables that are used in the following commands. These are the `env` and `profile` variables.

> The `env` variable is mostly synonymous with the NODE_ENV environment variable. Indeed, it specifies the environment-specific settings (usually stored in a .env file) that are used by the app. It is only relevant during the packaging process.
> 
> The `profile` variable indicates the [named AWS profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html). You should have configured this already in your `~/.aws` directory. You may or may not have a dedicated AWS environment for TEST vs PRODUCTION. To accomodate these differences, this variable provides the needed flexibility to direct the code to the correct environment.  

First, package the application code.

Example: packaging for `NODE_ENV=test` and an `medten-test` AWS profile...

```
npm run package --env=uiteam --profile=medten-test
```

Example: packaging for `NODE_ENV=production` and an `medten` AWS profile...

```
npm run package --env=production --profile=medten
```

Once the code is packaged, you can **deploy** it. Take care to use the correct `--env` and `--profile` variables. They should match what you choose for packaging.

This script uses AWS SAM **guided** deployment. This allows you to make choices (and save them for future use, if desired, about how you want to deploy the code). Typically all the defaults are used, but make sure to set the **AWS Region** to `us-west-1`, as the suggested default may not be correct.

Example: deploying using the `medten` AWS profile...

```
npm run deploy --env=production --profile=medten
```

Note, if you choose to save the configuration after all the guided deployment prompts, it will be saved in a `samconfig.toml` file by default. Since this file could be developer-specific, it should NOT be added to version control. To  **use** this file for subsequent deployments, you can use the command by specifying the `--config-file` parameter with the file and the `--config-env` parameter set to the environment name whose settings you want to use (assuming you saved them in the samconfig.toml file).

Example: deploy a `pkg-backend.yaml` packaged application using `samconfig.toml` for the `test` environment settings.

```
sam deploy -t pkg-backend.yaml --config-file samconfig.toml --config-env test
```