/*
 *  Licensed Materials - Property of IBM
 *  6949-04J
 *  © Copyright IBM Corp. 2020 All Rights Reserved
 */
const remSizeToPix = function(remSize, elemID = undefined) {
    let elem = document.documentElement;
    if(elemID) {
        elem = document.querySelector(`#${elemID}`);
    }
    const fontSize = getComputedStyle(elem).fontSize;
    return remSize * parseFloat(fontSize);
}

export { remSizeToPix };