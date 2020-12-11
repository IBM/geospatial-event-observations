/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
const cityCompare = function(a,b) {
    let cityA = a.city.toUpperCase();
    let cityB = b.city.toUpperCase();
    if (cityA > cityB) {
        return 1;
    }
    if (cityA < cityB) {
        return -1;
    }
    return 0;
}

const getLocation = function(id) {
    return new Promise(async (resolve, reject) => {
            try     {
                let response = await fetch(
                    process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations?locationId='+id
                );
                let body = await response.json();

                if (response.status !== 200) throw Error(body.message);

                resolve(body);
            } catch(err) {
                console.log(`An error has ocurred, ${err}`);
                reject(err);
            }
        }
    );
}

const getLocations = function() {
    return new Promise(async (resolve, reject) => {
            try     {
                let response = await fetch(
                    process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/locations'
                );
                let body = await response.json();

                if (response.status !== 200) throw Error(body.message);

                resolve(body);
            } catch(err) {
                console.log(`An error has ocurred, ${err}`);
                reject(err);
            }
        }
    );
}

export { cityCompare, getLocation, getLocations };