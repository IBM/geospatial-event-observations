/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
const getEvents = function() {
    return new Promise(async (resolve, reject) => {
            try     {
                let response = await fetch(
                    process.env.REACT_APP_API_ENDPOINT_URI+'api/v1.0/events'
                );
                let body = await response.json();

                if (response.status !== 200) throw Error(body.message);

                resolve(body);
            } catch(err) {
                console.log(`services/events - An error has ocurred, ${err}`);
                reject(err);
            }
        }
    );
}

export { getEvents };