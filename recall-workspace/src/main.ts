import { createApp } from "vue";
import Workspace from "./Workspace.vue";
import "./style.css";
const host = document.getElementById("evidenceWorkspace");
if (host) { createApp(Workspace).mount(host); window.LuminaEvidence = { version: "0.1.0" }; }
