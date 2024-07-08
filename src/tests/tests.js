import { testCases } from "./testcases";
import { urlVisualisation } from "../backendURLs"
import axios from 'axios'

export const runTests = async () => {
    var totalTestCases = testCases.length
    var passed = 0;

    for (let i = 0; i < totalTestCases; i++) {
        var postData = testCases[i].request
        await axios.post(urlVisualisation+"980/", postData,
            {
                headers: {
                    'Authorization': `Token ${localStorage.getItem("AccessToken")}`
                },
            }).then(({ data }) => {
                var nodesList = data["nodes"]
                if (JSON.stringify(nodesList) == JSON.stringify(testCases[i].expectedResponse.data.nodes))
                    ++passed;
                else{
                    console.log("Expected Response:- ")
                    console.log(JSON.stringify(testCases[i].expectedResponse.data.nodes))
                    console.log("Got Response:- ")
                    console.log(JSON.stringify(nodesList))
                }
            });
    }

    alert(`${passed} tests passed out of ${totalTestCases}`)
}