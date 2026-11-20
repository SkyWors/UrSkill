import { $ } from "./utils.js";
import { commit } from "./state.js";
import "./library.js";
import "./builder.js";
import "./tooltip.js";

const apiDialog = $("#api_dialog");

$("#api_open").addEventListener("click", () => apiDialog.showModal());

// The dialog element itself is only hit on the backdrop: its content lives in .dialog_body
apiDialog.addEventListener("click", (event) => {
	if (event.target === apiDialog) {
		apiDialog.close();
	}
});

commit(); // first render once every module has subscribed
