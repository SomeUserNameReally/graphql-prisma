import dotenv from "dotenv";
import commandLineArgs from "command-line-args";

// Setup command line options
const options = commandLineArgs([
    {
        name: "env",
        alias: "e",
        defaultValue: "dev",
        type: String
    }
]);

// Set the env file
const result = dotenv.config({
    path: `./${options.env}.env`
});

if (result.error) {
    throw result.error;
}
