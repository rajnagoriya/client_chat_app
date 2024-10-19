#Installation
1. **Clone the repository**:
    ```bash
    git clone https://github.com/rajnagoriya/chat_app.git
    cd chat_app
    ```
2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
3. **Set up the database**:
   Make sure you have MySQL installed and running. Create a database for the application, then update your `.env` file with your MySQL connection URL.

4. **Generate Prisma client**:
   After setting up the environment variables (especially the `DATABASE_URL`), generate the Prisma client by running:
    ```bash
    cd backend/src
    npx prisma generate
    ```

5. **Run database migrations**:
    ```bash
    npx prisma migrate dev
    ```
    ```bash
    npm run dev
    ```
3. **Frontend Setup (Next.js)**
  1. Navigate to the frontend folder:
     ```bash
     cd ass-chat-app
     ```
  2. Install the dependencies:
      ```bash
     npm install
     ```
  3. setup env ensure the backend url present .
  4. Start the frontend application:
     ```bash
     npm run dev
     ```
