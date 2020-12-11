/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
const getModels = function() {
    return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(
                    process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/models'
                );
                let body = await response.json();

                if (response.status !== 200) throw Error(body.message);

                resolve(body);
            } catch(err) {
                console.log(`services/models - An error has ocurred, ${err}`);
                reject(err);
            }
        }
    );
}

const modelCompare = function(a,b) {
    let modelA = a.name.toUpperCase();
    let modelB = b.name.toUpperCase();
    if (modelA > modelB) {
        return 1;
    }
    if (modelA < modelB) {
        return -1;
    }
    return 0;    
}

export { getModels, modelCompare };