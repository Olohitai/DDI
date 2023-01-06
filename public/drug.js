function init() {
  // your JavaScript code here

  const clearButton = document.getElementById("clear-all-button");
  const noInteraction = document.getElementById("no-interaction");
  const errorMessage = document.getElementById("error-message");
  const drugResult = document.getElementById("drug-results");
  const checkInteractionsButton = document.querySelector("#check-interactions");
  clearButton.addEventListener("click", () => {
    interactionsChecked = true;
    noInteraction.innerHTML = "";
    errorMessage.innerHTML = "";

    // clear the interactions from the drug-results element
    drugResult.innerHTML = "";
    // clear the interactions from the global variable
    window.interactions = [];

    checkInteractionsButton.disabled = true;
    fetch("/clear-all", {
      method: "POST",
      body: JSON.stringify({ clear: true }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      // Clear the rxcui array on the client side

      // Clear the drug list from the DOM
      const drugList = document.getElementById("drug-list");
      while (drugList.firstChild) {
        drugList.removeChild(drugList.firstChild);
      }
    });
  });
  let interactionsChecked = false;

  async function checkInteractions() {
    // if the response does not contain an error, clear the error message and display the search results
    errorMessage.innerHTML = "";
    if (interactionsChecked) {
      // interactions have already been checked, just display the previously retrieved interactions
      displayInteractions();
    } else {
      // send an HTTP request to the server to check for interactions

      const response = await fetch("/check-interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ rxcuis: rxcuis }) // send the rxcui array in the request body -->
      });
      const data = await response.json();
      // set the flag to true to indicate that the interactions have been checked
      interactionsChecked = true;
      // store the interactions in a global variable
      window.interactions = data.interactions;
      // display the interactions
      displayInteractions();
    }
  }
  document
    .getElementById("check-interactions")
    .addEventListener("click", checkInteractions);
  function displayInteractions() {
    // check if the interactions are present in the window object
    if (window.interactions.length === 0) {
      // clear the interactions from the drug-results element
      drugResult.innerHTML = "No interactions found";
    } else {
      // create a string of HTML to display the interactions
      console.log(window.interactions);
      const html = window.interactions
        .map((interaction) => `<p>${interaction}</p>`)
        .join("");
      drugResult.innerHTML = html;
    }
  }

  const form = document.getElementById("drug-form");

  form.addEventListener("submit", (event) => {
    const searchInput = document.getElementById("drugs");
    if (searchInput.value === "") {
      // show an error message or prevent the form from being submitted
      event.preventDefault();
    }
  });

  // window.addEventListener("beforeunload", (event) => {
  //   if (event.persisted) {
  //     // send a GET request to the server to clear the data
  //     fetch("/clear-all", {
  //       method: "GET",
  //     });
  //   }
  // });

  const icons = document.querySelectorAll(".fa-xmark");
  icons.forEach((icon) => {
    icon.addEventListener("click", (event) => {
      errorMessage.innerHTML = "";
      const drug = event.target.dataset.drug;
      fetch(`/drugs/${drug}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        // const noInteraction = noInteraction;
        if (drugResult.innerHTML !== "") {
          const updatedInteractions = window.interactions.filter(
            (interaction) => !interaction.toLowerCase().includes(drug)
          );

          window.interactions = updatedInteractions;

          displayInteractions();
          if (drugResult.innerHTML == "") {
            const p = document.createElement("p");
            p.textContent = "No Interactions Found";
            noInteraction.appendChild(p);
          }
        }

        // remove the drug from the DOM
        event.target.parentNode.remove();
      });
    });
  });
}
