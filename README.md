# comp7082-group11-project
Intro to Software Engineering Project

## Running the backend server

Prerequisites:  
node.js (v22.20.0(LTS))  
mongodb (8.2)

To run the server, you will need to do the following:  
Run ``npm install``in the root folder of the project  
Add .env file in project root (look at .env.sample for reference)  
Have a mongodb instance running  
Run ``node .\src\server.js`` in the project root

## Initialize the frontend submodule

This is required when cloning the project for the first time.

Run `git submodule update --init` to initialize the frontend submodule.

## Pull new changes from frontend

Run `git submodule update --remote` from the main project to pull new changes from the submodule repo.