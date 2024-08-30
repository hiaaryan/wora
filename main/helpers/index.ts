import { app } from "electron";

export * from "./create-window";

// For developing purposes
app.commandLine.appendSwitch('enable-angle-features', 'disableBlendFuncExtended');
app.commandLine.appendSwitch('use-angle', 'gl');