# Managing Database Structural Changes
Updated 1/1/2023 by Derek Gau

## Adding Columns to a Database Table/View

When adding new columns to a database table, it is important to insure that changes are granular, well-documented, predictable and easy to execute.

### Step 1: Confirm requirements.
Please do discuss the business requirements behind the request so you have a high-level understanding of the change being requested. Business owners should be able to suggest the column names as well as the general data type (text, date(time), boolean, integer, decimal). 

### Step 2: Create branch and write delta script.
Database changes should be made on a development branch, so create a new branch if you need to (and remember, generally branches should NOT contain a lot of different changes - stay focused!). Once the data requirements have been established, you can use the [d-YYYYMMDD.nn.sql](/sql/deltas/d-YYYYMMDD.nn.sql) file as a template for your data definition language (DDL) changes. This **delta script** should be placed in the `/sql/deltas` directory to begin with. Be sure to follow the naming convention. If you are implementing more than one **delta script** on the same day, specify the appropriate sequence as the `.nn` suffix (e.g. 'd-20230101.01', 'd-20230101.02', 'd-20230101.03'... etc.).

#### A word about modifying views.

The database makes use of many database views. Frequently, the view definitions select every column (i.e. `SELECT * from table`) from their source tables. However, views are "frozen" at the time of their creation. This means adding a column to a table (e.g. `t_product`) is not automatically reflected in dependent view(s) (e.g. `v_product`). Therefore, when writing your delta script, simply drop and re-add the views as necessary. Write a `DROP` statement first, then just copy view `CREATE` statement from [/sql/db-views-create.sql](/sql/db-views-create.sql) and then modify it as necessary.


### Step 3: Modify the master DDL files.

Any changes in your **delta script** should also be reflected in the two master DDL files that define the structure of the database. They are:

* [/sql/db-create.sql](/sql/db-create.sql) for defining database tables, foreign key relationships and indices
* [/sql/db-views-create.sql](/sql/db-views-create.sql) for defining database views

### Step 4: Update the API.

While most database column additions won't require API code modifications, it **is** sometimes necessary. Most API code selects all columns (i.e. `SELECT * FROM ...`) from tables/views in the database. As such, columns usually appear in API results automatically once they have been added to the database tables. However, API code modifications might be necessary when:

* you are adding a column which may also need to be **queryable** from the API. Example: if you added a column to the brand table and also wanted to make it queryable via `GET :baseurl/brands`.
* you are adding a column to a view/table used in an API that only returns **a subset of fields**. (Only a few APIs do this). Example: if you added a column to the product, family or equipment group table and also wanted to return it on the equipment compatibility API via `GET :baseurl/:product_id/equipment-compatibility`.

API classes are in the `/routes/api` directory.

### Step 5: Update swagger documentation.

When you make API changes, the Swagger documentation must also be kept up-to-date. Do this in the [/swaggerdoc.yaml](/swaggerdoc.yaml) file.

### Step 6: Commit changes to version control.

Commit your modifications to the branch. Your commit comment should be brief but at least be evocative of the database changes being made.

### Step 7: Initiate a pull request and test your changes.

Once changes are ready to be deployed, you can initiate a pull request. Work with other developers to review the changes. Typically changes will be deployed to the TEST environment first. While being verified in the TEST environment, the pull request will be kept open. 

### Step 8: Merge, deploy changes.

When your changes are successful and meet the business requirements, the pull request will be merged into the `main` branch in preparation for a production build. 

> Depending on the situation, you may be given permission to execute the changes on the PRODUCTION environment directly, but this will always involve authorization from a business owner or architect.

Once the code is merged, the development branch containing your database changes will be deleted.

## Modifying or removing Columns from a Database Table/View.

The same procedure applies as when adding columns to a database table. Typically modifications like modifying a column's data type involve fewer changes. 

Renaming a column or removing it from the database is usually a higher-impact change, but again follows the same steps.

## Loading master data.

Loading database master data (i.e. data that infrequently changes such as categories, marketing regions or image types) is rare.
