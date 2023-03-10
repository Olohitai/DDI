const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const path = require("path");
const session = require("express-session");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

let rxcuis = [];
let alreadyFetched = []; // array to store drugs that have already been fetched
let interactions = [];
// use the session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.post("/clear-all", (req, res) => {
  req.session.drugs = [];
  alreadyFetched = [];
  rxcuis = [];
  console.log(rxcuis);
  return res.redirect("/search");
});
app.get("/search", (req, res) => {
  // clear the array by setting it to an empty array
  req.session.drugs = [];
  alreadyFetched = [];
  rxcuis = [];
  console.log(`my session data : ${req.session.drugs}`);
  res.render("index");
});

app.post("/search", async (req, res) => {
  if (!req.session.drugs) {
    req.session.drugs = [];
  }

  if (!rxcuis) {
    rxcuis = [];
  }

  // Push the new drug onto the array
  const currentDrug = req.body.drugs.toLowerCase();
  req.session.drugs.push(currentDrug);

  // console.log(req.body.drugs);
  // check if the number of drugs is greater than or equal to 5
  if (alreadyFetched.length >= 5) {
    return res.render("index", {
      error: "You can only search for a maximum of 5 drugs at a time.",
      drugs: req.session.drugs,
    });
  }

  async function fetchDrug(drugName) {
    if (alreadyFetched.includes(drugName)) {
      console.log(`${drugName} has already been fetched. Skipping fetch.`);
      return;
    }
    // drug has not been fetched yet, so go ahead and fetch it
    console.log(`Fetching ${drugName}...`);

    fetch(
      `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${currentDrug}`
    )
      .then((response) => response.json())
      .then((data) => {
        // add the drug to the alreadyFetched array to track that it has been fetched
        alreadyFetched.push(currentDrug);
        const rxcui = data.approximateGroup.candidate[0].rxcui;

        rxcuis.push(rxcui);
        const rxcuiString = rxcuis.join("+");
        console.log(rxcuiString);
      })

      .catch((error) => {
        console.error(error);
      });
  }

  fetchDrug(currentDrug);
  res.render("index", { drugs: req.session.drugs });
});

app.post("/check-interactions", async (req, res) => {
  const rxcuiString = rxcuis.join("+");
  console.log(rxcuiString);

  // send an HTTP request to the Interaction API endpoint to retrieve the interaction information
  const response = await fetch(
    `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${rxcuiString}`
  );
  const data = await response.json();

  // const interactionDescriptions = [];

  if (data.fullInteractionTypeGroup) {
    // Loop through the fullInteractionTypeGroup array
    for (const fullInteractionTypeGroup of data.fullInteractionTypeGroup) {
      if (!fullInteractionTypeGroup || !data.fullInteractionTypeGroup) {
        interactionDescriptions = ["No Interaction found"];
      } else {
        // Loop through the fullInteractionType array
        for (const fullInteractionType of fullInteractionTypeGroup.fullInteractionType) {
          // Loop through the interactionPair array
          for (const interactionPair of fullInteractionType.interactionPair) {
            // For each interactionPair, create an object with the following properties:
            // - drug1Name: the name of the first drug
            // - drug2Name: the name of the second drug
            // - description: the description of the interaction
            // - severity: the severity of the interaction
            // Add this object to the interactions array
            interactions.push({
              drug1Name:
                interactionPair.interactionConcept[0].minConceptItem.name,
              drug2Name:
                interactionPair.interactionConcept[1].minConceptItem.name,
              description: interactionPair.description,
              rxcui1:
                interactionPair.interactionConcept[0].minConceptItem.rxcui,
              rxcui2:
                interactionPair.interactionConcept[1].minConceptItem.rxcui,
            });
          }
        }
      }
    }
  } else {
    // the fullInteractionTypeGroup property is not defined, so there are no known interactions between the drugs
    console.log("No known interactions between the drugs");
    // interactionDescriptions = [];
  }

  // Create a new Set to store unique interactions
  const interactionsSet = new Set();

  interactions = interactions.filter((interaction) => {
    if (interactionsSet.has(interaction.description)) {
      return false;
    } else {
      interactionsSet.add(interaction.description);
      return true;
    }
  });
  // Convert the Set to an array
  const interactionDescriptions = [...interactions];

  console.log(interactionDescriptions); // ['The risk or severity of renal failure, hypotension, and hyperkalemia can be increased when Lisinopril is combined with Losartan.']

  // // send the interaction information back to the client in the response
  return res.send({
    interactions: interactionDescriptions,
  });
});

app.delete("/drugs/:drug", (req, res) => {
  const { drug } = req.params;

  req.session.drugs = req.session.drugs.filter((d) => d !== drug);
  alreadyFetched = alreadyFetched.filter((d) => d !== drug);
  console.log(`This is alreaFetched array ${alreadyFetched}`);
  console.log(`This is sess array ${req.session.drugs}`);

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
