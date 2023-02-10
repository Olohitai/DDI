
# Drug-Drug Interaction Checker

A simple web application that allows users to search for up to 5 drugs and check for any potential drug-drug interactions. The interactions are obtained by making API calls to the National Library of Medicine's API.

## Features
- Users can search for up to 5 drugs at a time.
- The interactions between the selected drugs are displayed in a list.
- Users can clear their search history at any time.
- User-friendly interface

## Prerequisites
- Node.js must be installed on your machine.

## Installation
1. Clone the repository to your local machine:
```bash
git clone https://github.com/Olohitai/DDI.git
```
2. Navigate to the project directory:
```bash
cd drug-interaction-checker
```
3. Install the dependencies::
```bash
npm install
```
4. Start the application:
```bash
npm start
```
5. Open your browser and navigate to http://localhost:3000 to access the application.

## Technologies Used
- [Node.js](https://nodejs.org/): A JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Express](https://expressjs.com/): A web application framework for Node.js.
- [EJS](https://npmjs.com/package/ejs): A simple templating language for generating HTML.
- [node-fetch](https://github.com/node-fetch/node-fetch): A lightweight library for making HTTP requests in Node.js.


## API Reference
The application uses the National Library of Medicine's API to retrieve information about drug-drug interactions. The API documentation can be found [here](https://lhncbc.nlm.nih.gov/RxNav/AIs/api-Interaction.findDrugInteractions.html).

## License
This project is licensed under the MIT License.
