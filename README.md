# Sideshift AI Task - By Suhel

## Task

>Create a stripped down version of SideShift where users can exchange their USDC on the Optimism network for ARB tokens on the Arbitrum network. Your program will look for incoming USDC transactions to an address on Optimism, calculate the value of the deposit in ARB tokens (based on real-time exchange rates), and send the ARB tokens to the user on the Arbitrum network.

## How To Get Started:

There are two ways to get this project up and running:

1. Via Docker
2. Via local node

---

1. **Via Docker**

    To get started with this method:

    a. Make sure you have docker desktop up and running on 

    b. In your terminal, just type
        `docker-compose up`

2. **Via local node**

    To get started with this method, make sure you have postgresql up and running on port 5432

    a. Head over to the `.env` file and uncomment the following lines
    ```json
        # uncomment the below, if using locally
        # PGUSER=suhel
        # PGPASSWORD=8247
        # PGDB=suhel
        # PGHOST=localhost
    ```

    Make sure to replace the variables with what you have setup locally

    Also make sure to comment `PGHOST=db`, that works only on Docker containers.

    b. Install all the dependencies using
    ```bash
        npm install
    ```

    c. Once installed, run 
    ```bash
        npm start
    ``` 
    And the server would startup on port `3000`


--- 

## Where to send USDC on the optimism network?

Listener address - `0x123c058C58102a4eE0E24a3c7F0Cee2590e1c0f4`

---

## How to interact with the API endpoints?

*Use Postman or VS Code's Thunderclient extension to interact with the endpoints*

Make sure to append `http://localhost:3000` before every API call!

The `/database` endpoints are private, and are only accessible to registered users

To register yourself,

1. Make a `POST` request to `/register` route, in the request body, pass the following parameters:
```json
{
  "username": "<your-username-of-minimum-length-5>",
  "password": "<your-password-of-minimum-length-8>"
}
```
If the username and password are valid, the validation here is performed using zod, and if the username is not already taken, you would receive a success message

**NOTE**: The password is hashed and stored in the database using `argon2` library, so make sure to remember it!

2. After registering, make a `POST` request to `/login` route,  in the request body, pass the following parameters:
```json
{
  "username": "<your-username>",
  "password": "<your-password>"
}
```
Upon successful, validation you would receive the following in the response
```json
"data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdiOTVhYjJiLTg5MTgtNDFiZC05ZmE0LTE1NDVhNzU0YThjNiIsImlhdCI6MTcwNzc0NTc4MCwiZXhwIjoxNzA3NzQ5MzgwfQ.rTGNk3QqxzD4Yb8iMqjZKT4z5_ZN5WlOOvfQ1sBY11g"
  }
```
This `accessToken` would be used to access the database. 

This `accessToken` has an expiration time of **1 hour**, after which you would have to login again to get another ``accessToken`.

3. Once obtained, to access the `/database` endpoints, you would have to pass the `accessToken` in the request's `Authorization` header. 

    Pass the value as `Bearer <token-obtained>` to the `Authorization` header. 

    If the token has expired, user would be informed!

4. The `/database` endpoint has a lot of routes for different SQL operations

    **All endpoints listed here are only `GET` request methods**

    a. `/all` - This endpoint returns all the transactions in the database.

    b `/top5` - This endpoint returns the top 5 transactions based on the `USDC` value received.

    c. `/top5?sender=<address>` - Optionally, you could also attach a query parameter to the end to fetch the top 5 transactions made by a particular user based on the amount of `USDC` received

    d. `/lowest` - This endpoint fetches the transaction made with the lowest amount of `USDC`

    e. `/highestArbPrice` - This endpoint returns the highest price or `ARB` token in terms of `USD` value amongst all the transactions stored in the database.

    f. `/bySender?sender=<address>` - This endpoint returns all the transactions made by this particular user

    g. `/byOutgoingHash?outgoingHash=<arb-received-hash>` - This endpont takes in a transaction hash on the arbitrum network. This would return details about the entire transaction.

    h. `/byIncomingHash?incomingHash=<usdc-sent-hash>` - This endpont takes in a transaction hash on the optimism network. This would return details about the entire transaction.

    i. `/byUsdcThreshold?threshold=<amount-of-usdc-in-wei>` - This endpoint returns all transaction where the amount of `USDC` received is greater than the amount passed

    j. `/byDateRange?start=<date-in-MM/DD/YYYY>&end=<date-in-MM/DD/YYYY>` - This endpoint returns all the transactions made between the given date range

    k. `/bySenderSum?sender=<address>` - This endpoint takes in a user's address, and returns the total amount of `USDC` the user has sent to shift, and the amount of `ARB` tokens the user has received. All the values are in WEI.

    l. `/transactionCount` - This endpoint returns the total number of transactions made till date.

    m. `/transactionCount?sender=<address>` - This endpoint returns the number of transactions made by this partcular address.
 
    n. `/feeCollected` - This endpoint returns the total amount of fee collected in `USDC` on the optimism network.

    o. `/feeCollected?sender=<address>` - This endpoint returns the total amount of fee collected in `USDC` on the optimism network by a particular user.

    p. `/feeCollected?date=<date-in-MM/DD/YYYY>` - This endpoint returns the total amount of fee collected in `USDC` on the optimism network on a particular date.
    
    q. `/feeCollected?sender=<address>&date=<date-in-MM/DD/YYYY>` - This endpoint returns the total amount of fee collected in `USDC` on the optimism network by a particular user on a particular date.

    r. `/average/arb` - This endpoint returns the average price of the ARB tokens in `USD` fetched from coingecko.

    s. `/average/fee` - This endpoint returns the average fee that is collected on each transaction in `USDC`

    t. `/topSenders/:limit` - This endpoint returns a list of users and the amount of USDC sent in a ranked order. You have to set the limit of users returned.

---

## State Diagram

Attached below is the state diagram of the entire process

<image title="state diagram" src="./state-diagram.svg">

---

## Testing

This application has two main functions for performing math,

1. `/src/helper/calculateOnePercent.ts` - This function takes in the amount of `USDC` received, and returns 1% of the amount in `USDC` as fee.

2. `/src/helper/calculateAmount.ts` - This function takes in the amount of `USDC` received (after deduction of fee), and returns the amount of `ARB` tokens the user would receive in return.

To test these functions using Jest, run the following command in the terminal
```bash
    npm run test
```

---

## Linting

This application uses `eslint` and `prettier` for linting and formatting the code.

To run the linting, run the following command in the terminal
```bash
    npm run lint
```

To format the code using prettier, run the following command in the terminal
```bash
    npm run format
```