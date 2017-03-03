function generateRandomString(randomStrings) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const urlArr = [];

  for (let i = 0; i < 6; i++) {
    urlArr.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }

  if (Array.isArray(randomStrings) && randomStrings.indexOf(urlArr.join("")) !== -1) {
    return generateRandomString(randomStrings);
  } else if (!Array.isArray(randomStrings) && randomStrings[urlArr.join("")]) {
    return generateRandomString(randomStrings);
  } else {
    return urlArr.join("");
  }
}

module.exports = generateRandomString;
