/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
const BASE_URI = `${process.env.REACT_APP_API_ENDPOINT_URI}`;
const getRequest = async uri =>
  new Promise(async (resolve, reject) => {
    try {
      const resultJSON = await (await fetch(`${BASE_URI}/${uri}`)).json();
      resolve(resultJSON);
    } catch (err) {
      console.log(`An error has occured, ${err}`);
      reject(err);
    }
  });
const postRequest = uri => {};
export { getRequest, postRequest };
