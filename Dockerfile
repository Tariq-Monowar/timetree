# Step 1: Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Step 4: Install app dependencies (including dev dependencies for TypeScript)
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the TypeScript code
RUN npm run build

# Step 7: Expose the port your app runs on
EXPOSE 8081

# Step 8: Define the command to run the app
CMD ["npm", "start"]
