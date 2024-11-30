
## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/snowypy/SuperStudy-Backend.git
    cd SuperStudy-Backend
    ```

2. Install dependencies:
    ```sh
    npm i
    ```

3. Set up environment variables:
    - Copy [`.env-example`]() to a new file called [`.env`]() and fill in the values according to your needs.

4. Start the server:
    ```sh
    npm run build
    npm run production
    ```

## API Endpoints

### Account Routes

#### Login

- **Endpoint:** `/api/v2/account/login`
- **Method:** POST
- **Request Body:**
    ```json
    {
        "usernameOrEmail": "exampleUser" | "user@example.com",
        "password": "examplePassword"
    }
    ```
- **Response:**
    ```json
    {
        "token": "jwt-token",
        "user": { // [Coming Soon]
            "id": "user-id", // [Coming Soon]
            "username": "exampleUser", // [Coming Soon]
            "email": "user@example.com" // [Coming Soon]
        } // [Coming Soon]
    }
    ```

#### Register

- **Endpoint:** `/api/v2/account/register`
- **Method:** POST
- **Request Body:**
    ```json
    {
        "username": "exampleUser",
        "email": "user@example.com",
        "password": "examplePassword",
        "invitecode": "exampleCode"
    }
    ```
- **Response:**
    ```json
    {
        "message": "User registered successfully"
    }
    ```

### Admin Routes

#### Get All Users

- **Endpoint:** `/api/v2/admin/users`
- **Method:** GET
- **Response:**
    ```json
    [
        {
            "id": "user-id",
            "username": "exampleUser",
            "email": "user@example.com"
        },
        ...
    ]
    ```

#### Create Invite Code

- **Endpoint:** `/api/v2/admin/invite-code`
- **Method:** POST
- **Request Body:**
    ```json
    {
        "adminId": "1231235",
        "adminAuth": "???" // [Coming Soon]
    }
    ```
- **Response:**
    ```json
    {
        "message": "Created code: INV-1236"
    }
    ```

## Logging

The application uses `morgan` for logging HTTP requests with custom tokens for IP address, API key, request body, and response body.

## License

This project is licensed under the MIT License.